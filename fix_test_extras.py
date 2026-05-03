import os
import shutil

train_dir = "C:/FOOD_PREDICTION/backend/dataset/train"
test_dir = "C:/FOOD_PREDICTION/backend/dataset/test"

# Get all class names
train_classes = set(os.listdir(train_dir))
test_classes = set(os.listdir(test_dir))

# Find extra classes in test that are not in train
extra_classes = test_classes - train_classes

for cls in extra_classes:
    folder_path = os.path.join(test_dir, cls)
    shutil.rmtree(folder_path)  # Delete the folder
    print(f"Deleted extra class from test: {cls}")

print("\n✅ Done. Now both train and test have exactly the same classes.")
