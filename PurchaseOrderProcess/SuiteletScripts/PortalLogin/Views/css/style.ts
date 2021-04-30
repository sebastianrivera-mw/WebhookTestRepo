export const MAIN_STYLE = 
`<style>    
    h1, h2, h3, h4, p, label {            
        color: #5a5a5a;
    }

    h2{
        margin-bottom: 2rem;
    }

    .logo-tov{
        max-width: 8rem;
    }

    .main-container{
        height: 100%;
        width: 100%;
    }

    form, .formContent, .main-container, .logo-container{
        display: flex;
        flex-direction: column;
        justify-content: center;
        justify-items: center;
        align-content: center;
        align-items: center;
    }

    .formContent{
        max-width: 35rem;
    }
    
    form input{
        margin-top: 1rem;
        border-radius: 3px;
        padding: 0.5rem;
        background-color: #fafafa;
        border: 1px solid #818a91;
    }

    form label, form span{
        align-self: flex-start;
        margin-top: 1rem;
        margin-bottom: 0rem;
    }

    input{
        width: 100%;
        border: none; 
        border-width: 0; 
        box-shadow: none;
    }
    
    button, .button{
        color: #FFFFFF;
        background-color: #FA8787;
        border-radius: 100px 100px 100px 100px;
        border: none;
    }

    .error {
        margin-top: 0.5rem;
        color: red;
    }
</style>`;
