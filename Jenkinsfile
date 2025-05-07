pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE = "dubithal/weather-app"
        AWS_CREDENTIALS = credentials('aws-credentials')
        EC2_INSTANCE_TAG_KEY = "Name"
        EC2_INSTANCE_TAG_VALUE = "weather-app-server"
        AWS_REGION = "us-east-1"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                dir('app') {
                    sh "docker build -t ${DOCKER_IMAGE}:${BUILD_NUMBER} ."
                    sh "docker tag ${DOCKER_IMAGE}:${BUILD_NUMBER} ${DOCKER_IMAGE}:latest"
                }
            }
        }
        
        stage('Login to DockerHub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }
        
        stage('Push') {
            steps {
                sh "docker push ${DOCKER_IMAGE}:${BUILD_NUMBER}"
                sh "docker push ${DOCKER_IMAGE}:latest"
            }
        }

        stage('Deploy to EC2') {
            steps {
             withCredentials([usernamePassword(credentialsId: 'aws-credentials', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
             sh '''
                export AWS_DEFAULT_REGION=${AWS_REGION}
                
                # Find instance by tag
                echo "Finding EC2 instance with tag ${EC2_INSTANCE_TAG_KEY}=${EC2_INSTANCE_TAG_VALUE}"
                INSTANCE_ID=$(aws ec2 describe-instances \
                  --filters "Name=tag:${EC2_INSTANCE_TAG_KEY},Values=${EC2_INSTANCE_TAG_VALUE}" "Name=instance-state-name,Values=running" \
                  --query "Reservations[0].Instances[0].InstanceId" \
                  --output text)
                
                echo "Found EC2 instance with ID: $INSTANCE_ID"
                
                if [ "$INSTANCE_ID" = "None" ] || [ -z "$INSTANCE_ID" ]; then
                    echo "Could not find running instance with specified tag. Exiting with error."
                    exit 1
                fi
                
                # Check if SSM Agent is active on the instance
                SSM_STATUS=$(aws ssm describe-instance-information \
                  --filters "Key=InstanceIds,Values=${INSTANCE_ID}" \
                  --query "InstanceInformationList[0].PingStatus" \
                  --output text || echo "Error")
                  
                if [ "$SSM_STATUS" != "Online" ]; then
                    echo "SSM Agent is not running on the instance or the instance doesn't have the necessary IAM permissions."
                    echo "SSM Status: $SSM_STATUS"
                    exit 1
                fi
                
                echo "SSM Agent is running on the instance with status: $SSM_STATUS"
                
                # Send command via SSM
                echo "Sending deployment command via SSM..."
                COMMAND_ID=$(aws ssm send-command \
                  --instance-ids "$INSTANCE_ID" \
                  --document-name "AWS-RunShellScript" \
                  --parameters 'commands=["cd /home/ec2-user/dubi-proj/app && docker-compose down && docker pull dubithal/weather-app:latest && docker-compose build --no-cache flask nginx && docker-compose up -d"]' \
                  --output text --query "Command.CommandId")
                  
                echo "SSM command ID: $COMMAND_ID"
                
                if [ -z "$COMMAND_ID" ]; then
                    echo "Failed to send command via SSM."
                    exit 1
                fi
                
                # Wait for the command to complete
                echo "Waiting for SSM command execution to complete..."
                sleep 10
                
                # Check command status
                STATUS=$(aws ssm get-command-invocation \
                  --command-id "$COMMAND_ID" \
                  --instance-id "$INSTANCE_ID" \
                  --query "Status" --output text)
                  
                echo "Command status: $STATUS"
                
                # Wait longer if command is still running
                if [ "$STATUS" = "InProgress" ]; then
                    echo "Command still in progress, waiting up to 2 minutes for completion..."
                    for i in {1..12}; do
                        sleep 10
                        STATUS=$(aws ssm get-command-invocation \
                          --command-id "$COMMAND_ID" \
                          --instance-id "$INSTANCE_ID" \
                          --query "Status" --output text)
                        
                        echo "Command status after waiting: $STATUS"
                        
                        if [ "$STATUS" != "InProgress" ]; then
                            break
                        fi
                    done
                fi
                
                # Final check if command succeeded
                if [ "$STATUS" != "Success" ]; then
                    echo "Command failed with status: $STATUS"
                    # Get error output
                    aws ssm get-command-invocation \
                      --command-id "$COMMAND_ID" \
                      --instance-id "$INSTANCE_ID" \
                      --query "StandardErrorContent" --output text
                    exit 1
                fi
                
                echo "Deployment completed successfully!"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker logout'
        }
    }
}
