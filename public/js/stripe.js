const stripe = Stripe("pk_test_51NI2e2SDOW5CMu0Do36yIQVRzCm54otSxZZLZmCwP0TiMWCQx2ibtAlzw1Ew3aazzPcgXvADwgZ1kfJqyXAUoHSC008cdaOM9e");
import axios from "axios";
import { showAlert } from "./alerts";

export const bookTour =async tourId =>{
    // 1- Get checkout session from API
    try {
        const session = await axios
            .get(`http://localhost:8000/api/v1/booking/checkout-session/${tourId}`)
        
        
        await stripe.redirectToCheckout({
            sessionId:session.data.session.id
        })
    } catch(err){
        showAlert('error',err)
        console.log(err)
    }
    // 2- Create checkout form + charge the credit card
}