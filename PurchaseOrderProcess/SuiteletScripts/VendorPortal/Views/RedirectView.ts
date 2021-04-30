/**
 * @author Midware
 * @developer Bailin Huang
 * @contact contact@midware.net
 */

export function redirect(pURL) 
{
    let redirectHTML = 
    `<!DOCTYPE html>
    <html>
        <head>
        </head>
        <body>
        <div aria-label="loading" class="loader"></div>

        <style>
        .loader {
            border: 20px solid #f3f3f3;
            border-radius: 50%;
            border-top: 20px solid black;
            border-right: 20px solid black;
            border-bottom: 20px solid pink;
            border-left: 20px solid pink;
            width: 120px;
            height: 120px;
            -webkit-animation: spin 2s linear infinite;
            animation: spin 2s linear infinite;
            position: absolute;
            left: 50%;
            top: 35%;
            margin-left: -50px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
            </style>     
            
        <script>
            function redirect() {
                var newURL = new URL(document.location.href);
                
                console.log("Redirecting ${pURL}")
                if ('${pURL}' !== 'null'){
                    console.log("Redirecting ${pURL}")
                    window.location.replace('${pURL}');
                }
                else{
                    window.location.replace(newURL.href);
                }
            };

                console.log("Redirecting ${pURL}")
            setTimeout(redirect, 1000);
        </script>   
        </body>
    </html>`;
    return redirectHTML;
}
