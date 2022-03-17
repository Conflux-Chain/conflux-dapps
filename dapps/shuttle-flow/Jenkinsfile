/* -*- mode: groovy -*- */
pipeline {
  options {
    buildDiscarder logRotator(artifactDaysToKeepStr: '30', artifactNumToKeepStr: '50', daysToKeepStr: '60', numToKeepStr: '50')
    disableConcurrentBuilds()
    disableResume()
    durabilityHint 'PERFORMANCE_OPTIMIZED'
    timestamps()
  }

  agent none

  stages {
    
    stage('multiple env') {
      parallel {
        stage('ci env') {
          when {
            beforeAgent true
            anyOf {
              branch 'dev'
            }
          }
          agent {label 'bounty-backend-test-machine'}
          steps {
            nodejs(nodeJSInstallationName: 'nodejs15') {
              script {
                sh (label: 'build', script: """
yarn && yarn build
"""
                )
              }
            }
            script {
              sh (label: 'move to nginx www', script: """
mkdir -p /www
sudo rm -rf /www/rigel/ || true
sudo cp -r build /www/rigel
""")
            }
          }
        }

        stage('staging env') {
          when {
            beforeAgent true
            allOf {
              branch 'staging'
            }
          }
          agent {label 'pre_product_for_shuttleflow_frontend'}
          steps {
            nodejs(nodeJSInstallationName: 'nodejs15') {
              script {
                sh (label: 'build', script: """
yarn && yarn build
"""
                )
              }
            }
            script {
              sh (label: 'move builds', script: """
mkdir -p /www
sudo rm -rf /www/shuttleflow/ || true
sudo cp -r build /www/shuttleflow
""")
            }
          }
        }
        
        stage('prod env') {
          when {
            beforeAgent true
            allOf {
              branch 'main'
            }
          }
          agent {label 'shuttleflow-frontend-production-node'}
          steps {
            nodejs(nodeJSInstallationName: 'nodejs15') {
              script {
                sh (label: 'build', script: """
yarn && yarn build
"""
                )
              }
            }
            script {
              sh (label: 'move builds', script: """
mkdir -p /www
sudo rm -rf /www/shuttleflow/ || true
sudo cp -r build /www/shuttleflow
""")
            }
          }
        }
      }
    }
  }
}