const express = require('express');
const app = express();

const admin = require('firebase-admin');
const credentials = require('./key.json');


admin.initializeApp({
    credential: admin.credential.cert(credentials)
});
app.set("view engine","ejs");
app.use('/public', express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const db = admin.firestore();

app.get("/",(req,res)=>{
    res.render('index');
})

app.post("/create", async (req, res) => {
    try {
        console.log(req.body);
        const id = req.body.email;
        const userJson = {

            name: req.body.name,
            rollno: req.body.rollno,
            dept: req.body.dept,
            sem: req.body.sem,
            email: req.body.email,
            add: req.body.add
              
        };
        const response = await db.collection("users").doc(id).set(userJson);
        res.redirect('/read');

    } catch (error) {
        res.send(error);
    }

});


app.get('/read', async (req, res) => {
    try {
        const usersRef = db.collection("users");
        const usersResponse = await usersRef.get();

        const usersArray = [];
        for (const doc of usersResponse.docs) {
            const user = doc.data();
            const reportRef = db.collection("report").where("email", "==", user.email);
            const reportResponse = await reportRef.get();
            const reportArray = [];
            reportResponse.forEach(reportDoc => {
                reportArray.push(reportDoc.data());
            });
            user.reports = reportArray;
            usersArray.push(user);
        }

        res.render('read', { usersRef: usersArray });
    } catch (error) {
        res.send(error);
    }
});



// app.get('/read', async (req, res) => {
//     try {
//         const usersRef = db.collection("users");
//         const response = await usersRef.get();
//         const usersArray = [];
//         response.forEach(doc => {
//             usersArray.push(doc.data());
//         });
//         // res.send(usersArray);
//         res.render('read', { usersRef: usersArray });
       
//     } catch (error) {
//         res.send(error);
//     }
// });

// app.get("/read/all", async (req, res) => {
//     try {
//         const usersRef = db.collection("users");
//         const response = await usersRef.get();
//         let responseArr = [];
//         response.forEach(doc => {
//             responseArr.push(doc.data());
//         });
//         res.send(responseArr);
//         res.render("display",{usersRef})
//     }
//     catch (error) {
//         res.send(error);

//     }
// })

// app.get("/read/:id", async (req, res) => {
//     try {
//         const userRef = db.collection("users").doc(req.params.id);
//         const response = await userRef.get();

//         res.send(response.data());
//     }
//     catch (error) {
//         res.send(error);

//     }
// })

app.post("/update", async (req, res) => {
    try {
        const email = req.body.email;
        const nname = req.body.nname;
        const nrollno = req.body.nrollno;
        const ndept = req.body.ndept;
        const nsem = req.body.nsem;
       const nadd = req.body.nadd;
        const userRef = await db.collection("users").doc(email)
            .update({
           
                name:nname,
                rollno:nrollno,
                dept:ndept,
                sem:nsem,
                add:nadd
                

            })
            res.redirect('/read');
    }
    catch (error) {
        res.send(error);

    }
})

app.post("/delete/:email", async (req, res) => {
    try {
        
        const response = await db.collection("users").doc(req.params.email).delete();

        res.redirect("/read");
    }
    catch (error) {
        res.send(error);

    }
});

app.post("/tfees", async (req, res) => {
    try {
        console.log(req.body);
    
        const userJson = {

            email: req.body.email,
            tfee: req.body.tfee,
            in: req.body.in,
            date: req.body.date
          
        };
        const response = await db.collection("report").add(userJson);
       
        res.redirect('/read');

    } catch (error) {
        res.send(error);
    }

});






const port = 8080;
app.listen(port, () => {
    console.log(`server running on port no ${port}`);
})