resource "aws_ecs_cluster" "doomsday_ecs_cluster" {
  name = var.ecs_cluster_name
}

data "aws_caller_identity" "current" {}

resource "aws_ecs_task_definition" "doomsday_ecs_task" {
  family             = "doomsday-app"
  network_mode       = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                = 256
  memory             = 512
  execution_role_arn = aws_iam_role.ecs_task_exec_role.arn
  task_role_arn = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name : "doomsday-app-container"
      image = "${data.aws_caller_identity.current.account_id}.dkr.ecr.${var.default_region}.amazonaws.com/${var.ecr_repo_name}:latest"
      essential : true,
      portMappings : [
        {
          "containerPort" : 3000,
          "hostPort" : 3000
        }
      ],
      environment: [
        {
          name  = "DB_HOST"
          value = aws_db_instance.doom_db_instance.address
        },
        {
          name  = "DB_PORT"
          value = "5432"
        },
        {
          name  = "DB_NAME"
          value = aws_db_instance.doom_db_instance.db_name
        },
        {
          name  = "DB_USER"
          value = local.db_creds.username
        },
        {
          name      = "DB_PASSWORD"
          value = local.db_creds.password
        },
      ],
      secrets : [

      ],
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group = aws_cloudwatch_log_group.ecs_logs.name
          awslogs-create-group = "true"
          awslogs-region = var.default_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_lb" "doomsday_app_alb" {
  name                             = "doomsday-ecs-alb"
  internal                         = false
  load_balancer_type               = "application"
  security_groups = [aws_security_group.ecs_sg.id]
  subnets = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]
  enable_deletion_protection       = false
  enable_cross_zone_load_balancing = true
  drop_invalid_header_fields       = true
}

resource "aws_lb_target_group" "doomsday_app_alb_target_group" {
  name        = "doomsday-elb-target-group"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    interval            = 30
    path                = "/health"
    port                = "80"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
    healthy_threshold   = 2
  }
}

resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.doomsday_app_alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.doomsday_app_alb_target_group.arn
  }
}

resource "aws_cloudwatch_metric_alarm" "alb_requests_high_alarm" {
  alarm_name          = "alb-high-request-count"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "RequestCountPerTarget"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "500"
  alarm_description   = "Triggers when ALB request count per target is high"
  dimensions = {
    LoadBalancerArn = aws_lb.doomsday_app_alb.arn
    TargetGroupArn  = aws_lb_target_group.doomsday_app_alb_target_group.arn
  }

  alarm_actions = [aws_appautoscaling_policy.scale_up_requests_policy.arn]
}

resource "aws_cloudwatch_metric_alarm" "alb_requests_low_alarm" {
  alarm_name          = "alb-low-request-count"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "5"
  metric_name         = "RequestCountPerTarget"
  namespace           = "AWS/ApplicationELB"
  period              = "60"
  statistic           = "Average"
  threshold           = "100"
  alarm_description   = "Triggers when ALB request count per target is low"
  dimensions = {
    LoadBalancerArn = aws_lb.doomsday_app_alb.arn
    TargetGroupArn  = aws_lb_target_group.doomsday_app_alb_target_group.arn
  }
  alarm_actions = [aws_appautoscaling_policy.scale_down_requests_policy.arn]
}

resource "aws_ecs_service" "doomsday_app_service" {
  name            = "doomsday-app-service"
  cluster         = aws_ecs_cluster.doomsday_ecs_cluster.id
  task_definition = aws_ecs_task_definition.doomsday_ecs_task.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets = [aws_subnet.subnet_a.id, aws_subnet.subnet_b.id]
    security_groups = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.doomsday_app_alb_target_group.arn
    container_name   = "doomsday-app-container"
    container_port   = 3000
  }

  depends_on = [aws_lb.doomsday_app_alb]
}

resource "aws_appautoscaling_target" "ecs_service_scaling" {
  max_capacity       = 5
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.doomsday_ecs_cluster.name}/${aws_ecs_service.doomsday_app_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"

  depends_on = [aws_ecs_service.doomsday_app_service]
}

# resource "aws_iam_role" "ecs_task_execution_role" {
#   name = "ecs-task-execution-role"
#
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Action = "sts:AssumeRole"
#         Effect = "Allow"
#         Principal = {
#           Service = "ecs-tasks.amazonaws.com"
#         }
#       },
#     ]
#   })
# }
#
# resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_ecr" {
#   policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
#   role       = aws_iam_role.ecs_task_execution_role.name
# }
#
# resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_cloudwatch" {
#   policy_arn = "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
#   role       = aws_iam_role.ecs_task_execution_role.name
# }
#
# resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_s3" {
#   policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
#   role       = aws_iam_role.ecs_task_execution_role.name
# }
#
# resource "aws_iam_role_policy_attachment" "ecs_task_execution_policy_ssm" {
#   policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
#   role       = aws_iam_role.ecs_task_execution_role.name
# }
