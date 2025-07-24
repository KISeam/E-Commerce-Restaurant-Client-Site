import React from 'react'
import useAuth from '../../../hooks/useAuth';

const UserHome = () => {
    const { user } = useAuth();
  return (
    <div>
        <h1 className='text-3xl text-black'>User Home</h1>
        <p className='text-xl text-gray-700'>Welcome, {user?.displayName || 'User'}!</p>
    </div>
  )
}

export default UserHome