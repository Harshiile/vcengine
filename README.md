<p align="center">
  <img src="public/logo.svg" alt="Project Logo" width="150" />
</p>

<h1 align="center"><b>V'DURA</b></h1>

### 1. **Clone the repository** 
```bash
# Cloning from github

# If you use - http
    git clone https://github.com/harshiile/version-control-project.git

# If you use - ssh
    git clone git@github.com:harshiile/version-control-project.git

# Moving to directory
cd version-control-project
```

### 2. **Installing Dependencies**
```bash
# If you don't have yarn package manager, first install it via
npm install -g yarn

# Installing dependencies
yarn
```

### 3. **Running Services & Server**
```bash
# Automated by running script - run.sh scripts need permission to execute/run
./scripts/run.sh

# Manually

    # Starting Database & Redis Services - Docker compose
    yarn services:start

    # Building Project
    yarn build

    # Starting Redis Workers
    yarn worker:mail # Mail Worker
    yarn worker:version # Version Worker

    # Running Main Server
    yarn dev
```