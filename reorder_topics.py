import json

# Read the current topics.json
with open('/Users/jalil/.gemini/antigravity/scratch/math-mastery-app/src/data/topics.json', 'r') as f:
    topics = json.load(f)

# Create a mapping of module IDs to their data
modules = {}
for topic in topics:
    modules[topic['id']] = topic

# Define the new order
new_order = [
    'singapore-p3',
    'singapore-p4',
    'bar-model-level-1',
    'bar-model-level-2',
    'bar-model-level-3',
    'singapore-p5',
    'singapore-p6',
    'hiroo',
    'mita',
    'ultimate-prep'
]

# Reorder topics
reordered_topics = []
for module_id in new_order:
    if module_id in modules:
        reordered_topics.append(modules[module_id])

# Write the reordered topics back
with open('/Users/jalil/.gemini/antigravity/scratch/math-mastery-app/src/data/topics.json', 'w') as f:
    json.dump(reordered_topics, f, indent=4, ensure_ascii=False)

print("Topics reordered successfully!")
print(f"New order: {[t['title'] for t in reordered_topics]}")
