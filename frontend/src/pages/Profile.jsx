import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {getDownloadURL, getStorage,ref, uploadBytes, uploadBytesResumable} from 'firebase/storage';
import { prepareAutoBatched } from "@reduxjs/toolkit";
import { app } from "../firebase";
import { useDispatch } from "react-redux";
import { updateUserStart, updateUserFailure, updateUserSuccess, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserSuccess, signOutUserFailure,signOutUserStart } from "../redux/user/userSlice";
import { Link } from "react-router-dom";
import { set } from "mongoose";

export default function Profile() {
    const fileRef = useRef(null);
    const {currentUser, loading, error} = useSelector((state)=>state.user);
    const [file,setFile] = useState(undefined);
    const [filePerc,setFilePerc] = useState(0);
    const [fileUploadError,setFileUploadError] = useState(false);
    const [formData,setFormData] = useState({});
    const dispatch = useDispatch();
    const [userUpdated, setUserUpdated] = useState(false);
    const [showListingError, setShowListingError] = useState(false); 
    const [userListings, setUserListings] = useState([]); 

    const handleDelete = async () => {
        dispatch(deleteUserStart());
        try {
            const res = await fetch(`/backend/user/delete/${currentUser._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if(data.success === false) {
                dispatch(deleteUserFailure(data.message));
                return;
            }

            dispatch(deleteUserSuccess(data));
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
        }
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value,
        });
    };
    
    const handleSubmit= async (e) => {
        e.preventDefault();
        try {
          dispatch(updateUserStart());
          const res = await fetch(`/backend/user/update/${currentUser._id}`, { 
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
          });
          const data = await res.json();
          if(data.success ===false)
          {
            dispatch(updateUserFailure(data.message));
            return;
          }
          dispatch(updateUserSuccess(data));
          setUserUpdated(true);
          setTimeout(() => {
            setUserUpdated(false);
          }, 3000);
        } catch (error) {
          dispatch(updateUserFailure(error.message));
        }
    };

    const handleSignout = async () => {
        try {
          dispatch(signOutUserStart());
            const res = await fetch('/backend/user/sign-out', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if(data.success === false) {
                 dispatch(signOutUserFailure(data.message));
                return;
            }
            dispatch(signOutUserSuccess(data));
        } catch (error) {
            dispatch(signOutUserFailure(error.message));
        }
    }


    useEffect(()=>{
        if(file){
            handleFileUpload(file);
        }
    },[file]);

    const handleFileUpload = (file) =>{
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage,fileName);
        const uploadTask = uploadBytesResumable(storageRef,file);
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred /
                    snapshot.totalBytes)*100;   
                setFilePerc(Math.round(progress));   
            },
        (error)=>{
            setFileUploadError(true);
        },
        ()=>{
            getDownloadURL(uploadTask.snapshot.ref).then
            ((downloadURL)=>{
                setFormData({...formData,avatar:downloadURL});
            })
        }
        );
    }

    const handleShowListings = async () => {
        try {
          setShowListingError(false);
            const res = await fetch(`/backend/user/listings/${currentUser._id}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if(data.success === false) {
                setShowListingError(true);
                return;
            }
            setUserListings(data);
            //console.log(data); // Handle the listings data as needed
            setShowListingError(false);
        } catch (error) {
             setShowListingError(true);
        }
    }

    const handleDeleteListing = async (listingId) => {
        try {
            const res = await fetch(`/backend/listing/delete/${listingId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            const data = await res.json();
            if(data.success === false) {
                 
                return;
            }
            setUserListings(userListings.filter(listing => listing._id !== listingId));
        } catch (error) {
             
        }
    }

  return (
    <div className='p-3 max-w-lg mx-auto'>
      <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
         
        <input onChange={(e)=>setFile(e.target.files[0])}
        type="file" ref={fileRef} hidden accept="image/*"/>
        <img
          onClick={()=>fileRef.current.click()} 
          src={formData.avatar || currentUser.avatar}
          alt='profile'
          className='rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2'
        />

         <p className='text-sm self-center'>
          {fileUploadError ? (
            <span className='text-red-700'>
              Error Image upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className='text-slate-700'>{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className='text-green-700'>Image successfully uploaded!</span>
          ) : (
            ''
          )}
        </p>

        

        <input
          type='text'
          placeholder='username'
          onChange={handleChange}
          defaultValue={currentUser.username}
          id='username'
          className='border p-3 rounded-lg'
          
        />
        <input
          type='email'
          placeholder='email'
          onChange={handleChange}
          id='email'
          defaultValue={currentUser.email}
          className='border p-3 rounded-lg'
           
        />
        <input
          type='password'
          placeholder='password'
          onChange={handleChange}
          id='password'
          className='border p-3 rounded-lg'
        />
        <button
           disabled={loading}
          className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'
        >
        {loading ? 'Updating...' : 'Update Profile'}
        </button>
         <Link
          className='bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95'
          to={'/create-listing'}
        >
          Create Listing
        </Link>
      </form>

      <div className='flex justify-between mt-5'>
        <span
          onClick={handleDelete} 
          className='text-red-700 cursor-pointer'
        >
          Delete account
        </span>
        <span  onClick={handleSignout} className='text-red-700 cursor-pointer'>
          Sign out
        </span>
      </div>
       <p className='text-red-700 mt-5'>{error? error: ''}</p>
       <p className="text-green-700">{userUpdated? "User Updated Successfully": ""}</p>
       <button
            onClick={handleShowListings}
            className="text-green-700"
              >
        Show Listings
       </button>
       <p className="text-red-700 mt-5">  
        {showListingError?'Error fetching listings. Please try again later.': ''}
       </p>

        {userListings && userListings.length > 0 && (
        
        <div className='flex flex-col gap-4'>
          
          <h1 className='text-center mt-7 text-2xl font-semibold'>
            Your Listings
          </h1>

          {userListings.map((listing) => (
            <div
              key={listing._id}
              className='border rounded-lg p-3 flex justify-between items-center gap-4'
            >
              <Link to={`/listing/${listing._id}`}>
                <img
                  src={listing.imageUrls[0]}
                  alt='listing cover'
                  className='h-16 w-16 object-contain'
                />
              </Link>
              <Link
                className='text-slate-700 font-semibold  hover:underline truncate flex-1'
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className='flex flex-col item-center'>
                <button
                  onClick={() => handleDeleteListing(listing._id)}
                  className='text-red-700 uppercase'
                >
                  Delete
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-700 uppercase'>Edit</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}