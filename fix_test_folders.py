import os

train_dir = "C:/FOOD_PREDICTION/backend/dataset/train"
test_dir = "C:/FOOD_PREDICTION/backend/dataset/test"

# Get all class folders
train_classes = set(os.listdir(train_dir))
test_classes = set(os.listdir(test_dir))

# Find missing classes in test
missing_classes = train_classes - test_classes

for cls in missing_classes:
    dst = os.path.join(test_dir, cls)
    os.makedirs(dst, exist_ok=True)  # Create the folder
    print(f"Created missing class folder in test: {cls}")
