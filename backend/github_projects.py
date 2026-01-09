import requests

res = requests.get("https://api.github.com/users/goncalopinto1/repos")
data = res.json()

projects_clean = []

for repo in data:
    if "portfolio" in repo.get("topics", []): #in case topics don't exists
        if not repo["fork"] and repo["description"]:
            project = {
                "name": repo["name"],
                "description": repo["description"],
                "url": repo["html_url"],
                "language": repo["language"],
            }
            projects_clean.append(project)