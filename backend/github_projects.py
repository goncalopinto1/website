import requests
from models import Project 

def fetch_projects():
    res = requests.get("https://api.github.com/users/goncalopinto1/repos")
    data = res.json()

    projects = []

    for repo in data:
        if "portfolio" in repo.get("topics", []): #in case topics don't exists
            if repo["description"]:
                project = Project(
                    name=repo["name"],
                    description=repo["description"],
                    url=repo["url"],
                    language=repo["language"]
                )
                projects.append(project)

    return projects
