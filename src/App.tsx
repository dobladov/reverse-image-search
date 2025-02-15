import { useCallback, useState } from 'react'

import 'normalize.css';
import './App.css'

const providers = {
    Google: {
      searchUrl: "https://lens.google.com/uploadbyurl?url="
    },
    Bing: {
      searchUrl: "https://www.bing.com/images/search?view=detailv2&iss=sbi&q=imgurl:"
    },
    Yandex: {
      searchUrl: "https://yandex.com/images/search?source=collections&rpt=imageview&url="
    },
    TinyEye: {
      searchUrl: "https://www.tineye.com/search/?&url="
    },
}

const uploadToCatbox = async (file: File) => {
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', file);

  try {
    const response = await fetch('https://cors-anywhere.herokuapp.com/https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    const result = await response.text();
    console.log('File uploaded to Catbox:', result);
    return result;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

export const App = () => {
  const params = new URLSearchParams(window.location.search)
  const imageUrl = params.get('imageUrl')

  const [searchImage, setSearchImage] = useState<string | null>(imageUrl)

  const manualUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const localImage = (e.target as HTMLInputElement).files?.[0];
    if (localImage) {
      upload(localImage);
    }
  }

  const upload = (localImage: File) => {
    if (localImage) {
      const reader = new FileReader();
      reader.onload = async () => {
        // Renders the image before the upload
        // setSearchImage(reader.result as string);

        const catboxUrl = await uploadToCatbox(localImage);
        console.log(catboxUrl, 'DAN 🐸: catboxUrl');
        if (catboxUrl) {
          setSearchImage(catboxUrl);
        }
      };
      reader.readAsDataURL(localImage);
    }
  }

  const setInputUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const imageUrl = e.target.value
    console.log(imageUrl);
    setSearchImage(imageUrl)
  }



  const validateUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const isValid = searchImage && (validateUrl(searchImage))

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      upload(file);
    }
  }, []);

  return (
    <div>
      <h1>Reverse image search</h1>

      <div
        className='dropzone'
        style={{
          backgroundColor: isDragging ? '#646cff' : '',
        }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drag and drop your image here</p>
      </div>

      <p>Or</p>
      <input
        type="file"
        name="localImage"
        accept="image/*" 
        onChange={manualUpload}
      />
      
      <p>Or</p>
      <input
        className='urlInput'
        placeholder='Image URL https:// or http://'
        type="search"
        name='imageUrl'
        onChange={setInputUrl}
        defaultValue={imageUrl || ''}
      />
      
      {
        isValid && (
          <div className='results'>
          <h2 className='resultTitle'>Find similar images using:</h2>
          <ul className='providerList'>
            {Object.entries(providers).map(([provider, { searchUrl }]) => (
              <li key={provider}>
                <a href={searchUrl + searchImage} target='_blank' rel='noreferrer'>{provider}</a>
              </li>
            ))}
          </ul>
          <img 
            className='preview'
            src={searchImage}
            alt='searchImage'
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
        )
      }
    </div>
  )
}
