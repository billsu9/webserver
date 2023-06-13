const fs = require("fs");

//function buildhtml(connection, response)
function buildhtml(connection, callback)
{//this func shows query result as html files. 
    connection.execute('SELECT * FROM postinfo', (error, results, fields) => 
    {
        if (error) throw error;
        
        // Start building the HTML string
        //let html = '<!DOCTYPE html><html><head><title>Posts</title></head><body>';
        //html += '<h1>Posts</h1><table border="1"><tr><th>ID</th><th>Title</th><th>Content</th><th>Author</th><th>Date</th></tr>';

        let html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Posts</title></head><body>';
        html += '<h1>Posts</h1><table border="1"><tr><th>ID</th><th>Title</th><th>Content</th><th>Author</th><th>Date</th></tr>';
        // Loop through the results and add them to the HTML string
        for(let post of results) 
        {
            html += `<tr>
                    <td>${post.id}</td>
                    <td>${post.title}</td>
                    <td>${post.content}</td>
                    <td>${post.author}</td>
                    <td>${post.post_date}</td>
                </tr>`;
        }
        
        // End the HTML string
        html += '</table></body></html>';
        
        // Write the HTML string to a file
        
        fs.writeFile('posts.html', html, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
            //response.setHeader('Content-Type', 'text/plain');
            //response.end('The file has been saved!');

            callback(); // Call the callback function when done
        });
    });
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

function sendhtml(filename,code,response)
{
    console.log("sendhtml");
    fs.readFile(`./${filename}`,(error,data)=>{
        if(error)
        {
            console.log("sendhtml error");

            response.statusCode = 500;
            response.setHeader("Content-type","text/plain");
            response.end(`error!!! status code: ${code}`);
        }else
        {

            console.log("sendhtml ok");
            response.statusCode = code;
            response.setHeader("Content-type","text/html");
            response.end(data);
        }
    })
} 

module.exports={
    sendhtml,
    buildhtml,
}
