import os
import matplotlib.pyplot as plt

# Path to Train folder
train_path = "dataset/Train"

# Class folders
categories = ['freshapples', 'rottenapples']
counts = []

# Count number of images in each category
for category in categories:
    folder = os.path.join(train_path, category)
    num_images = len([f for f in os.listdir(folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    counts.append(num_images)

# Pie chart
plt.figure(figsize=(6, 6))
plt.pie(counts, labels=categories, autopct='%1.1f%%', colors=['#90ee90', '#ff9999'])
plt.title('Distribution of Fresh and Rotten Apples in Train Dataset')
plt.show()