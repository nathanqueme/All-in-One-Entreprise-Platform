
the ImagePicker from 'react-native-image-crop-picker' has a problem, the widht on android is the height and vice verca. 

To make sure there is no problem use "getImageDimensionRatio(base64)" instead.



+ having a fixed widht and height and the cropping enabled in freestyle forces android phones to crompress the image into a square --> it breaks the aspect ratio.