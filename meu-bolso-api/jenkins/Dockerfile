FROM jenkins/jenkins:lts

USER root

RUN apt-get update \
 && apt-get install -y \
    docker.io \
    make \
    build-essential \
    wget \
    ca-certificates \
    curl \
    git \
    unzip \
    libssl-dev \
    zlib1g-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    libffi-dev \
    liblzma-dev \
    tk-dev \
    xz-utils \
 && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
 && apt-get install -y nodejs \
 && npm install -g npm \
 && curl -fsSL -o /usr/local/bin/kubectl https://dl.k8s.io/release/v1.29.3/bin/linux/amd64/kubectl \
 && chmod +x /usr/local/bin/kubectl \
 && wget -qO /tmp/trivy.tar.gz https://github.com/aquasecurity/trivy/releases/download/v0.68.2/trivy_0.68.2_Linux-64bit.tar.gz \
 && tar -xzf /tmp/trivy.tar.gz -C /usr/local/bin trivy \
 && rm -f /tmp/trivy.tar.gz \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

USER jenkins

USER root
RUN apt-get update && apt-get install -y docker.io
USER jenkins