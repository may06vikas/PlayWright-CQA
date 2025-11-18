pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Run Playwright Tests') {
            steps {
                sh 'npx playwright install --with-deps'
                echo 'test running'
            }
        }

        stage('Archive Results') {
            steps {
               
            }
        }
    }

    post {
        always {
            junit ''
        }
    }
}
