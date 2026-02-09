pipeline {
    agent any

    environment {
        REGISTRY = 'localhost:5000'
        IMAGE_TAG = "v1.0.${BUILD_NUMBER}"
        BACKEND_IMAGE = "${REGISTRY}/bagly-backend"
        FRONTEND_IMAGE = "${REGISTRY}/bagly-frontend"
    }

    stages {
        stage('1. Checkout') {
            steps {
                checkout scm
                sh 'git --version'
                sh 'node --version'
                sh 'npm --version'
            }
        }

        stage('2. Build') {
            parallel {
                stage('2.1 Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
                stage('2.2 Build Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }

        stage('3. Unit Tests') {
            parallel {
                stage('3.1 Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm run test:coverage -- --run'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
                stage('3.2 Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm run test:coverage -- --run'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'backend/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Backend Coverage Report'
                            ])
                        }
                    }
                }
            }
        }

        stage('4. SonarQube Scan') {
            environment {
                SONAR_TOKEN = credentials('sonar-token')
            }
            stages {
                stage('4.1 Backend Sonar') {
                    steps {
                        dir('backend') {
                            withSonarQubeEnv('SonarQube') {
                                sh '''
                                    sonar-scanner \
                                        -Dsonar.projectKey=bagly-backend \
                                        -Dsonar.projectName="Bagly Backend" \
                                        -Dsonar.sources=src \
                                        -Dsonar.tests=src \
                                        -Dsonar.test.inclusions=**/*.test.ts \
                                        -Dsonar.exclusions=**/node_modules/**,**/*.test.ts,**/coverage/**,**/prisma/**,**/*.routes.ts,**/config/env.ts,**/config/redis.ts,**/lib/** \
                                        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                                '''
                            }
                        }
                        timeout(time: 10, unit: 'MINUTES') {
                            waitForQualityGate abortPipeline: true
                        }
                    }
                }
                stage('4.2 Frontend Sonar') {
                    steps {
                        dir('frontend') {
                            withSonarQubeEnv('SonarQube') {
                                sh '''
                                    sonar-scanner \
                                        -Dsonar.projectKey=bagly-frontend \
                                        -Dsonar.projectName="Bagly Frontend" \
                                        -Dsonar.sources=src \
                                        -Dsonar.tests=src \
                                        -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx \
                                        -Dsonar.exclusions=**/node_modules/**,**/*.test.ts,**/*.test.tsx,**/coverage/**,**/components/**,**/pages/** \
                                        -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
                                        -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                                '''
                            }
                        }
                        timeout(time: 10, unit: 'MINUTES') {
                            waitForQualityGate abortPipeline: true
                        }
                    }
                }
            }
        }

        stage('5. Trivy Repo Scan') {
            steps {
                sh '''
                    echo "Scanning repository for vulnerabilities..."
                    trivy fs . \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        --ignore-unfixed \
                        --no-progress \
                        --format table
                '''
            }
        }

        stage('6. Docker Build') {
            parallel {
                stage('6.1 Docker Frontend') {
                    steps {
                        dir('frontend') {
                            sh "docker build --build-arg APP_VERSION=${IMAGE_TAG} -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -t ${FRONTEND_IMAGE}:latest ."
                        }
                    }
                }
                stage('6.2 Docker Backend') {
                    steps {
                        dir('backend') {
                            sh "docker build --build-arg APP_VERSION=${IMAGE_TAG} -t ${BACKEND_IMAGE}:${IMAGE_TAG} -t ${BACKEND_IMAGE}:latest ."
                        }
                    }
                }
            }
        }

        stage('7. Trivy Image Scan') {
            steps {
                sh """
                    echo "Scanning backend image for vulnerabilities..."
                    trivy image \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        --ignore-unfixed \
                        --no-progress \
                        --format table \
                        ${BACKEND_IMAGE}:${IMAGE_TAG}
                """
                sh """
                    echo "Scanning frontend image for vulnerabilities..."
                    trivy image \
                        --exit-code 1 \
                        --severity HIGH,CRITICAL \
                        --ignore-unfixed \
                        --no-progress \
                        --format table \
                        ${FRONTEND_IMAGE}:${IMAGE_TAG}
                """
            }
        }

        stage('8. Push & Tag') {
            when {
                expression {
                    return env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'main'
                }
            }
            stages {
                stage('8.1 Push to Registry') {
                    steps {
                        sh """
                            docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                            docker push ${FRONTEND_IMAGE}:latest
                            docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                            docker push ${BACKEND_IMAGE}:latest
                        """
                    }
                }
                stage('8.2 Create Git Tag') {
                    steps {
                        withCredentials([usernamePassword(
                            credentialsId: 'github-credentials',
                            usernameVariable: 'GIT_USER',
                            passwordVariable: 'GIT_TOKEN'
                        )]) {
                            sh '''
                                git config user.email "jenkins@bagly.com.br"
                                git config user.name "Jenkins CI"
                                git tag -a ${IMAGE_TAG} -m "Release ${IMAGE_TAG} - Build #${BUILD_NUMBER}"
                                git push https://${GIT_USER}:${GIT_TOKEN}@github.com/${GIT_USER}/bagly-cicd.git ${IMAGE_TAG}
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            sh '''
                docker image prune -f || true
            '''
            cleanWs()
        }
        success {
            echo "Pipeline concluído com sucesso!"
            echo "Imagens geradas: ${FRONTEND_IMAGE}:${IMAGE_TAG}, ${BACKEND_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline falhou! Verifique os logs acima."
        }
    }
}