from app import app
from models import Template
import pprint

def list_templates():
    with app.app_context():
        templates = Template.find_all()
        print(f"Found {len(templates)} templates:")
        for tpl in templates:
            pprint.pprint({k: v for k, v in tpl.items() if k != '_id'})

if __name__ == "__main__":
    list_templates()
