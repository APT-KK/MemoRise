import torch
from torchvision.models import resnet50, ResNet50_Weights
from PIL import Image

# Config for the topP sampling {Nucleus} process 
TOP_P = 0.90      
MAX_TAGS = 10     
MIN_CONFIDENCE = 0.02 

# Loading the pre-trained model and weights
weights = ResNet50_Weights.DEFAULT
model = resnet50(weights=weights)
model.eval()

preprocess = weights.transforms()

def generate_tags(image_path):
    try:
        img = Image.open(image_path).convert('RGB') # resnet only accepts 3-channel images (RBG), png images have RGBA
        batch = preprocess(img).unsqueeze(0) # resize to 224x224 and add batch dimension
        
        with torch.no_grad():
            prediction = model(batch) 

            probs = torch.nn.functional.softmax(prediction[0], dim=0) # get probabilities for each class/tag
            
            sorted_probs, sorted_indices = torch.sort(probs, descending=True)
            
            cumulative_probs = torch.cumsum(sorted_probs, dim=0)
            
            cutoff_indices = (cumulative_probs > TOP_P).nonzero() 
            
            if cutoff_indices.numel() > 0:
                k = cutoff_indices[0].item() + 1
            else:
                k = len(probs) 
            
            k = min(k, MAX_TAGS) 
            
            tags = []
            for i in range(k):
                prob = sorted_probs[i].item()
                idx = sorted_indices[i].item()
                
                if prob < MIN_CONFIDENCE:
                    continue

                category_name = weights.meta['categories'][idx] # in_built category names
                clean_tag = category_name.replace('_', ' ')
                tags.append(clean_tag)
            
            return tags

    except Exception as e:
        print(f"Error generating tags: {e}")
        return []