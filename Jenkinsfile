pipeline {
    agent any

    environment {
        REGISTRY = 'localhost:5001'
        IMAGE_TAG = "v1.0.${BUILD_NUMBER}"
        BACKEND_IMAGE = "${REGISTRY}/meu-bolso-api"
        FRONTEND_IMAGE = "${REGISTRY}/meu-bolso-web"
        SONAR_HOST = 'http://meu-bolso-sonarqube:9000'
        SONAR_NETWORK = 'infra_meu-bolso-ci'
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
                            sh 'npm run test:cov'
                        }
                    }
                }
                stage('3.2 Backend Tests') {
                    steps {
                        dir('meu-bolso-api') {
                            sh 'npm run test:cov'
                        }
                    }
                }
            }
        }

        stage('4. SonarQube Scan') {
            parallel {

stage('4.1 Backend Sonar') {
  steps {
    withSonarQubeEnv('SonarQube') {
      dir('meu-bolso-api') {
        sh '''
          docker run --rm \
            --network infra_meu-bolso-ci \
            -e SONAR_HOST_URL=$SONAR_HOST_URL \
            -e SONAR_TOKEN=$SONAR_AUTH_TOKEN \
            -v "$PWD:/usr/src" \
            -w /usr/src \
            sonarsource/sonar-scanner-cli \
            -Dsonar.projectKey=meu-bolso-api \
            -Dsonar.projectName="Meu Bolso API" \
            -Dsonar.sources=src \
            -Dsonar.test.inclusions="src/**/*.{spec,test}.ts" \
            -Dsonar.exclusions="**/node_modules/**,**/dist/**,**/coverage/**" \
            -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info \
            -Dsonar.typescript.tsconfigPath=tsconfig.sonar.json
        '''
      }
    }
  }
}


                stage('4.2 Frontend Sonar') {
                    steps {
                        withSonarQubeEnv('SonarQube') {
                            dir('meu-bolso-web') {
                                sh '''
                                docker run --rm \
                                    --network infra_meu-bolso-ci \
                                    -e SONAR_HOST_URL=$SONAR_HOST_URL \
                                    -e SONAR_TOKEN=$SONAR_AUTH_TOKEN \
                                    -v "$PWD:/usr/src" \
                                    -w /usr/src \
                                    sonarsource/sonar-scanner-cli \
                                    -Dsonar.projectKey=meu-bolso-web \
                                    -Dsonar.projectName="Meu Bolso Web" \
                                    -Dsonar.sources=. \
                                    -Dsonar.tests=. \
                                    -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/** \
                                    -Dsonar.test.inclusions=**/*.spec.ts,**/*.test.ts \
                                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                                    -Dsonar.typescript.tsconfigPath=tsconfig.sonar.json
                                '''
                            }
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
                stage('6.1 Frontend Image') {
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
                stage('6.2 Backend Image') {
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
                    --severity CRITICAL \
                    --ignore-unfixed
                """
                sh """
                  trivy image ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                    --exit-code 1 \
                    --severity CRITICAL \
                    --ignore-unfixed
                """
            }
        }

        stage('8. Push & Tag') {
            when {
                expression {
                    sh(
                        script: 'git branch -r --contains HEAD | grep -q origin/main',
                        returnStatus: true
                    ) == 0
                }
            }

            stages {
                stage('8.1 Push Images') {
                    steps {
                        sh """
                          docker push ${BACKEND_IMAGE}:${IMAGE_TAG}
                          docker push ${BACKEND_IMAGE}:latest
                          docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                          docker push ${FRONTEND_IMAGE}:latest
                        """
                    }
                }

                stage('8.2 Git Tag') {
                    steps {
                        withCredentials([usernamePassword(
                            credentialsId: 'github-credentials',
                            usernameVariable: 'GIT_USER',
                            passwordVariable: 'GIT_TOKEN'
                        )]) {
                            sh '''
                              git config user.email "jenkins@meubolso.dev"
                              git config user.name "Jenkins CI"
                              git tag -a ${IMAGE_TAG} -m "Release ${IMAGE_TAG}"
                              git push https://${GIT_USER}:${GIT_TOKEN}@github.com/${GIT_USER}/meu-bolso-ci-cd.git ${IMAGE_TAG}
                            '''
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
            echo "Pipeline concluído com sucesso"
        }
        failure {
            echo "Pipeline falhou — verifique os logs"
        }
    }
}
