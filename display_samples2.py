import os
import cv2
import matplotlib.pyplot as plt

# Paths
train_path = "dataset/Train"
categories = ['freshokra', 'rottenokra']
image_size = (128, 128)

features = []
labels = []

# Feature Extraction: Average color
for label, category in enumerate(categories):
    folder_path = os.path.join(train_path, category)
    for file in os.listdir(folder_path):
        if file.lower().endswith(('.jpg', '.jpeg', '.png')):
            img_path = os.path.join(folder_path, file)
            img = cv2.imread(img_path)
            if img is not None:
                img = cv2.resize(img, image_size)
                mean_color = img.mean(axis=(0, 1))  # Average BGR
                features.append((mean_color[1], mean_color[2]))  # G vs R
                labels.append(label)

# Split features for plotting
fresh_x = [f[0] for i, f in enumerate(features) if labels[i] == 0]
fresh_y = [f[1] for i, f in enumerate(features) if labels[i] == 0]
rotten_x = [f[0] for i, f in enumerate(features) if labels[i] == 1]
rotten_y = [f[1] for i, f in enumerate(features) if labels[i] == 1]

# Plot
plt.figure(figsize=(8, 6))
plt.scatter(fresh_x, fresh_y, color='green', label='Fresh okra', alpha=0.6)
plt.scatter(rotten_x, rotten_y, color='red', label='Rotten okra', alpha=0.6)
plt.xlabel('Average Green Intensity')
plt.ylabel('Average Red Intensity')
plt.title('Scatter Plot: Fresh vs Rotten okra (Based on Color)')
plt.legend()
plt.grid(True)
plt.show()
