import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";


const AuthContext = createContext();


export function AuthProvider({ children }) {
const [user, setUser] = useState(null);
const [isAdmin, setIsAdmin] = useState(false);
const [loading, setLoading] = useState(true);


useEffect(() => {
return onAuthStateChanged(auth, async currentUser => {
setUser(currentUser);


if (currentUser) {
const token = await currentUser.getIdTokenResult();
setIsAdmin(token.claims.admin === true);
} else {
setIsAdmin(false);
}


setLoading(false);
});
}, []);


return (
<AuthContext.Provider value={{ user, isAdmin, loading }}>
{children}
</AuthContext.Provider>
);
}


export function useAuth() {
return useContext(AuthContext);
}