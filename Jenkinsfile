pipeline {
    agent any

    environment {
        REGISTRY = 'localhost:5001'
        IMAGE_TAG = "v1.0.${BUILD_NUMBER}"
        BACKEND_IMAGE = "${REGISTRY}/meu-bolso-api"
        FRONTEND_IMAGE = "${REGISTRY}/meu-bolso-web"
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
                        dir('meu-bolso-web') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                }
                stage('2.2 Build Backend') {
                    steps {
                        dir('meu-bolso-api') {
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
                        dir('meu-bolso-web') {
                            sh 'npm run test:coverage -- --run'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'meu-bolso-web/coverage',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }

                stage('3.2 Backend Tests') {
                    steps {
                        dir('meu-bolso-api') {
                            sh 'npm run test:coverage -- --run'
                        }
                    }
                    post {
                        always {
                            publishHTML(target: [
                                allowMissing: true,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'meu-bolso-api/coverage',
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
            parallel {

                stage('4.1 Backend Sonar') {
                    steps {
                        dir('meu-bolso-api') {
                            withSonarQubeEnv('SonarQube') {
                                sh '''
                                    sonar-scanner \
                                      -Dsonar.projectKey=meu-bolso-api \
                                      -Dsonar.projectName="Meu Bolso API" \
                                      -Dsonar.sources=src \
                                      -Dsonar.tests=src \
                                      -Dsonar.test.inclusions=**/*.spec.ts,**/*.test.ts \
                                      -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/*.module.ts \
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
                        dir('meu-bolso-web') {
                            withSonarQubeEnv('SonarQube') {
                                sh '''
                                    sonar-scanner \
                                      -Dsonar.projectKey=meu-bolso-web \
                                      -Dsonar.projectName="Meu Bolso Web" \
                                      -Dsonar.sources=src \
                                      -Dsonar.tests=src \
                                      -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx \
                                      -Dsonar.exclusions=**/node_modules/**,**/coverage/** \
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
                    trivy fs . \
                      --exit-code 1 \
                      --severity HIGH,CRITICAL \
                      --ignore-unfixed \
                      --no-progress
                '''
            }
        }

        stage('6. Docker Build') {
            parallel {

                stage('6.1 Docker Frontend') {
                    steps {
                        dir('meu-bolso-web') {
                            sh """
                              docker build \
                                -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                                -t ${FRONTEND_IMAGE}:latest .
                            """
                        }
                    }
                }

                stage('6.2 Docker Backend') {
                    steps {
                        dir('meu-bolso-api') {
                            sh """
                              docker build \
                                -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                                -t ${BACKEND_IMAGE}:latest .
                            """
                        }
                    }
                }
            }
        }

        stage('7. Trivy Image Scan') {
            steps {
                sh """
                  trivy image ${BACKEND_IMAGE}:${IMAGE_TAG} \
                    --exit-code 1 \
                    --severity HIGH,CRITICAL \
                    --ignore-unfixed
                """

                sh """
                  trivy image ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                    --exit-code 1 \
                    --severity HIGH,CRITICAL \
                    --ignore-unfixed
                """
            }
        }

        stage('8. Push & Tag') {
            when {
                branch 'main'
            }
            stages {

                stage('8.1 Push to Registry') {
                    steps {
                        sh """
                          docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                          docker push ${BACKEND_IMAGE}:latest
                          docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                          docker push ${FRONTEND_IMAGE}:latest
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
                            sh """
                              git config user.email "jenkins@meubolso.dev"
                              git config user.name "Jenkins CI"
                              git tag -a ${IMAGE_TAG} -m "Release ${IMAGE_TAG}"
                              git push https://${GIT_USER}:${GIT_TOKEN}@github.com/${GIT_USER}/MeuBolsoCICD.git ${IMAGE_TAG}
                            """
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
            cleanWs()
        }
        success {
            echo "Pipeline concluído com sucesso!"
            echo "Imagens: ${FRONTEND_IMAGE}:${IMAGE_TAG}, ${BACKEND_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline falhou — verifique os logs."
        }
    }
}
