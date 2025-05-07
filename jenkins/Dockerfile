FROM jenkins/jenkins:lts

USER root

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
    docker.io \
    git \
    curl \
    sudo \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    groff \
    less \
    unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# התקנת AWS CLI v2
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf aws awscliv2.zip

# התקנת Session Manager plugin
RUN curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" -o "session-manager-plugin.deb" && \
    dpkg -i session-manager-plugin.deb && \
    rm session-manager-plugin.deb

RUN jenkins-plugin-cli --plugins \
    git \
    pipeline-stage-view \
    docker-workflow \
    github \
    credentials \
    workflow-aggregator \
    blueocean \
    configuration-as-code \
    github-branch-source \
    git-client \
    git-server \
    multibranch-scan-webhook-trigger

RUN usermod -aG docker jenkins

USER jenkins

ENV JENKINS_OPTS="--httpPort=8080"
ENV JENKINS_SLAVE_AGENT_PORT=50000

CMD ["/usr/local/bin/jenkins.sh"]
