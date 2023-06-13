const http = require("http");
const port = 3000;
const ip = "127.0.0.1";
const base = `http://${ip}:${port}`;

const fs = require("fs");//讀取"*.html"的檔案
const { error } = require("console");

const {sendhtml} = require("./mymodule");//use func "sendhtml" in file "mymodule".
const {buildhtml} = require("./mymodule");

const mysql = require("mysql2");
const { connect } = require("http2");
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Ooooxxxx88',
    database:'blogs',
    charset: 'utf8mb4' // Use utf8mb4 character set
});

const webserver = http.createServer(function(request,response)
{
    const url = request.url;
    const method = request.method;
    console.log("x1 url:",url,"method:",method);

    const urlobj = new URL(url,base);
    console.log("x2 ref:",urlobj.href);

    if(method === "GET")
    {
        switch(urlobj.pathname)
        {
            case "/":
                sendhtml("welcom.html",200,response);
            break;

            case "/login.html":
                sendhtml("login.html",200,response);
            break;

            case "/form2.html":
                sendhtml("form2.html",200,response);
            break;

            case "/getPosts"://查詢mysql的資料庫，並且結果渲染在網頁上面。
                //buildhtml(connection,response);
                //sendhtml("posts.html",200,response);

                buildhtml(connection, ()=>
                {
                    sendhtml("posts.html",200,response);
                });

                //look up the database and output result as file "getPosts.html"
                //connection.execute('SELECT * FROM postinfo', (error, results, fields) => {
                //    if (error) throw error;
                //});            
            break;

            default:
                response.statusCode = 404;
                response.setHeader("Content-Type", "text/plain");
                response.end("404 Not Found");
            break;
        }

        /*
        if(urlobj.pathname === "/")
        {
            fs.readFile("./welcom.html",(error,data)=>
            {
                if(error)
                {
                    response.statusCode = 500;
                    response.setHeader("Content-type","text/explain");
                    response.end("Error html page(status code: 500)!!!");
                }
                else
                {
                    response.statusCode = 200;
                    response.setHeader("Content-type","text/html");
                    response.end(data);
                }
            })   
           sendhtml("welcom.html",200,response);
        }
        else if(urlobj.pathname === "/login.html")
        {
            sendhtml("login.html",200,response);
        }
        */
    }
    else if(method === "POST")
    {   
        console.log("method url=",url);
        const qy = require("querystring");
        
        let receivedata = "";
        let contentType = request.headers['content-type'];
        
        request.on("data",(chunk)=>{
            receivedata += chunk.toString();
        });

        request.on("end",()=>
        {
            //console.log("header=",request.headers);
            console.log("contentype=",contentType); 

            if (contentType === 'application/json') 
            {
                // 解析 JSON 数据
                receivedata = JSON.parse(receivedata);
            }
            else
            {   //object null
                receivedata = qy.parse(receivedata);
            }
            console.log("receivedata:",receivedata);

            switch (receivedata.type) 
            {
                case "article":
                    //In html file "form2.html" set "JASON" and article type.
                    const post = 
                    {// set object "post".
                        id: receivedata.id,
                        title: receivedata.title,
                        content: receivedata.content,
                        author: receivedata.author,
                        post_date: receivedata.post_date
                    };
                    console.log("post2database",post);

                    //執行將資料輸入mysql資料庫
                    connection.execute(`INSERT INTO postinfo (id, title, content, author, post_date) VALUES(?, ?, ?, ?, ?)`,
                    [post.id, post.title, post.content, post.author, post.post_date],
                    (error,results)=>{
                        if(error){
                            throw error;
                            console.log("data inserted",results);
                        }

                        //here confirm post data ok !!!
                        connection.execute(`SELECT * FROM postinfo`,
                        (error,results,fields)=>{
                            if(error){
                                throw error;
                            }
                            console.log("data received =",results);
                        });
                    });
                    break;

                case "login":
                    if((receivedata.username === "bill") && (receivedata.password === "bill"))
                    {
                        console.log("Verify ID ok");
                        sendhtml("root.html",200,response);
                    }
                    else
                    {
                        console.log("Verify ID failed");
                        // Here you might want to return an error page or message.
                        response.statusCode = 401;
                        response.setHeader("Content-Type", "text/plain");
                        response.end("Invalid username or password");
                    }
                    break;

                // 其他类型...
                default:
                    console.log("Unknown data type");
            }
        });
    }

    else if (method === 'OPTIONS') 
    {
        console.log("!!! CORS Case method =",method);
        // Preflight request. Reply successfully:
        response.setHeader('Access-Control-Allow-Origin', '*');//允许任何域访问此服务器的资源
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        response.statusCode = 204;
        response.end();
    }
    else
    {
        console.log("error!!! method =",method);
        response.end("this is bill's test web server");
    }
});

webserver.listen(port,ip,()=>
{
    console.log("start listening at add:",base);
});
