import { useState } from 'react';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaCamera, FaSpinner } from 'react-icons/fa';

const PhotoUpload = ({ currentPhoto, name }) => {
  const { user, login } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto || null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload to cloudinary
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);

      const { data } = await API.post('/upload/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update user in localStorage
      const updatedUser = { ...user, photo: data.photo };
      login(updatedUser);

      toast.success('Profile photo updated!');
    } catch (err) {
      toast.error('Failed to upload photo');
      setPreview(currentPhoto);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <img
        src={preview || `https://ui-avatars.com/api/?name=${name}&background=0ea5e9&color=fff&size=128`}
        alt={name}
        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
      />
      <label
        className={`absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition shadow-md ${
          uploading ? 'opacity-60 cursor-not-allowed' : ''
        }`}>
        {uploading
          ? <FaSpinner className="animate-spin" size={13} />
          : <FaCamera size={13} />
        }
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default PhotoUpload;