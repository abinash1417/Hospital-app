pipeline {
    agent any

    environment {
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
        AWS_REGION            = 'eu-north-1'
        AWS_ACCOUNT_ID        = '159372032168'
        ECR_BACKEND           = '159372032168.dkr.ecr.eu-north-1.amazonaws.com/hospital-backend'
        ECR_FRONTEND          = '159372032168.dkr.ecr.eu-north-1.amazonaws.com/hospital-frontend'
        S3_BUCKET             = 'hospital-app-frontend-159372'
        MONGO_URI             = credentials('mongo-uri')
        JWT_SECRET            = credentials('jwt-secret')
        EMAIL_USER            = credentials('email-user')
        EMAIL_PASS            = credentials('email-pass')
        CLOUDINARY_NAME       = credentials('cloudinary-name')
        CLOUDINARY_KEY        = credentials('cloudinary-key')
        CLOUDINARY_SECRET     = credentials('cloudinary-secret')
        GROQ_API_KEY          = credentials('groq-api-key')
        ADMIN_EMAIL           = credentials('admin-email')
        ADMIN_PASSWORD        = credentials('admin-password')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/abinash1417/Hospital-app.git'
            }
        }

        stage('Build Backend Image') {
            steps {
                bat 'docker build -t hospital-backend ./backend'
            }
        }

        stage('Build Frontend Image') {
            steps {
                bat 'docker build -t hospital-frontend ./frontend'
            }
        }

        stage('Push to ECR') {
            steps {
                bat '"C:\\Program Files\\Amazon\\AWSCLIV2\\aws.exe" ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %AWS_ACCOUNT_ID%.dkr.ecr.%AWS_REGION%.amazonaws.com'
                bat 'docker tag hospital-backend:latest %ECR_BACKEND%:latest'
                bat 'docker tag hospital-frontend:latest %ECR_FRONTEND%:latest'
                bat 'docker push %ECR_BACKEND%:latest'
                bat 'docker push %ECR_FRONTEND%:latest'
            }
        }

        stage('Deploy Backend via SSM') {
            steps {
                script {
                    def instanceId = bat(
                        returnStdout: true,
                        script: '"C:\\Program Files\\Amazon\\AWSCLIV2\\aws.exe" ec2 describe-instances --filters "Name=tag:Name,Values=hospital-backend-server" "Name=instance-state-name,Values=running" --query "Reservations[0].Instances[0].InstanceId" --output text --region %AWS_REGION%'
                    ).trim().readLines().last()

                    bat """
                        "C:\\Program Files\\Amazon\\AWSCLIV2\\aws.exe" ssm send-command ^
                        --instance-ids ${instanceId} ^
                        --document-name "AWS-RunShellScript" ^
                        --parameters "commands=['aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 159372032168.dkr.ecr.eu-north-1.amazonaws.com && docker pull 159372032168.dkr.ecr.eu-north-1.amazonaws.com/hospital-backend:latest && docker stop hospital-backend || true && docker rm hospital-backend || true && docker run -d --name hospital-backend --restart always -p 5000:5000 --env-file /home/ec2-user/.env 159372032168.dkr.ecr.eu-north-1.amazonaws.com/hospital-backend:latest']" ^
                        --region %AWS_REGION%
                    """
                }
            }
        }

        stage('Deploy Frontend to S3') {
            steps {
                bat '"C:\\Program Files\\Amazon\\AWSCLIV2\\aws.exe" s3 sync frontend\\dist\\ s3://%S3_BUCKET% --region %AWS_REGION% --delete'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}