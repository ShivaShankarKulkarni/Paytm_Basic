import { Appbar } from "../components/AppBar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"
import axios from "axios";
import { useEffect, useState } from 'react';

export const Dashboard = () => {
    const [amt, setAmt] = useState(0);
    useEffect(() =>{
        axios.get("http://localhost:3000/api/v1/account/balance",{
            headers: {
                Authorization: "Bearer " + localStorage.getItem("token")
            }
        }).then(response => {
            setAmt(response.data.balance);
        })            
    },[]);
    return <div>
        <Appbar />
        <div className="m-8">
            <Balance value={amt} />
            <Users />
        </div>
    </div>
}