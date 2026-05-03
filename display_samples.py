import os
import cv2
import matplotlib.pyplot as plt

# Corrected path from your folder structure
base_path = "dataset/Train"
categories = ['freshapples', 'rottenapples']
image_size = (128, 128)

# Load sample images from each category
def load_sample_images(class_name, num_samples=5):
    folder_path = os.path.join(base_path, class_name)
    images = []
    for filename in os.listdir(folder_path)[:num_samples]:
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            img_path = os.path.join(folder_path, filename)
            img = cv2.imread(img_path)
            if img is not None:
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                img = cv2.resize(img, image_size)
                images.append(img)
    return images

# Load and display
samples = {category: load_sample_images(category) for category in categories}

plt.figure(figsize=(12, 4))
for idx, category in enumerate(categories):
    for i, img in enumerate(samples[category]):
        plt.subplot(2, 5, idx * 5 + i + 1)
        plt.imshow(img)
        plt.title(category)
        plt.axis('off')

plt.suptitle("Sample Images: Fresh vs Rotten Apples")
plt.tight_layout()
plt.show()

