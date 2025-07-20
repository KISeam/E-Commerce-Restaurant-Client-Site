// import React, { useContext } from 'react'
// import useAxiosSecure from './useAxiosSecure';
// import { AuthContext } from '../providers/AuthProvider';
// import { useQuery } from '@tanstack/react-query';

// const useAdmin = () => {
//   const { user, loading } = useContext(AuthContext);
//     const axiosSecure = useAxiosSecure();
//     const { data: isAdmin, isPending: isAdminLoading } = useQuery({
//         queryKey: [user?.email, 'isAdmin'],
//         enabled: !loading,
//         queryFn: async () => {
//             console.log('asking or checking is admin', user)
//             const res = await axiosSecure.get(`/users/admin/${user.email}`);
//             return res.data?.admin;
//         }
//     })
//     return [isAdmin, isAdminLoading]
// }

// export default useAdmin