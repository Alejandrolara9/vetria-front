pipeline {
    agent any

    options {
        timeout(time: 60, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        PROJECT_KEY             = 'vetria-frontend'
        PROJECT_NAME            = 'Vetria Frontend'
        GITHUB_URL              = 'https://github.com/Alejandrolara9/vetria-front.git'
        BRANCH                  = 'main'
        NEXT_TELEMETRY_DISABLED = '1'
    }

    stages {
        stage('Checkout') {
            steps {
                cleanWs()
                git branch: "${BRANCH}",
                    url: "${GITHUB_URL}",
                    credentialsId: 'github-pat'
                echo "Checked out commit: ${env.GIT_COMMIT}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm ci --prefer-offline'
            }
        }

        stage('Dependency Audit') {
            steps {
                sh 'mkdir -p reports'
                catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                    sh '''
                        npm audit --audit-level=high --json > reports/npm-audit.json || true
                        npm audit --audit-level=high
                    '''
                }
            }
            post {
                always {
                    archiveArtifacts artifacts: 'reports/npm-audit.json', allowEmptyArchive: true
                }
            }
        }

        stage('TypeScript Check') {
            steps {
                sh 'npx tsc --noEmit'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Unit Tests') {
            steps {
                sh 'npm test -- --ci --forceExit'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'reports/junit.xml'
                    archiveArtifacts artifacts: 'coverage/lcov.info', allowEmptyArchive: true
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    script {
                        def scannerHome = tool 'SonarQubeScanner'
                        sh """
                            ${scannerHome}/bin/sonar-scanner \\
                                -Dsonar.projectKey=${PROJECT_KEY} \\
                                -Dsonar.projectName="${PROJECT_NAME}" \\
                                -Dsonar.projectVersion=${BUILD_NUMBER} \\
                                -Dsonar.sources=src \\
                                -Dsonar.tests=src \\
                                -Dsonar.test.inclusions=**/__tests__/**/*.ts,**/__tests__/**/*.tsx,**/*.spec.ts,**/*.spec.tsx,**/*.test.ts,**/*.test.tsx \\
                                -Dsonar.exclusions=**/node_modules/**,**/.next/**,**/public/**,**/*.d.ts \\
                                -Dsonar.sourceEncoding=UTF-8 \\
                                -Dsonar.typescript.tsconfigPath=tsconfig.json \\
                                -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    post {
        always {
            cleanWs(cleanWhenNotBuilt: false,
                    deleteDirs: true,
                    disableDeferredWipeout: true)
        }
        success {
            echo "Pipeline ${PROJECT_NAME} - Build #${BUILD_NUMBER} completed successfully."
        }
        failure {
            echo "Pipeline ${PROJECT_NAME} - Build #${BUILD_NUMBER} FAILED."
        }
    }
}
