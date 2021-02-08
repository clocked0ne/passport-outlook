const passport = require("passport");
const OutlookStrategy = require("../lib/strategy");

passport.use(
  new OutlookStrategy(
    {
      callbackURL: "http://localhost:3000/auth/outlook/redirect",
      passReqToCallback: true,
      clientID: "3d1dc301-4f26-4b9c-a641-640d237c5ebe",
      clientSecret: "6o9sdc.u3eI-YQ_BGa4zeJ~G9_0mgbr2Tc",
      userProfileURL: "https://graph.microsoft.com/v1.0/me/",
    },
    (req, accessToken, refreshToken, profile, done) => {
      if (profile._json.id) {
        let user = {
          auth_id: profile._json.id,
          email: profile._json.userPrincipalName,
          pic_link: "#",
        };
        console.log(profile);
        done(null, user);
      } else {
        done(null, null, { message: "Invalid Authentication" });
      }
    }
  )
);

const app = require("express")();

app.use(passport.initialize());

app.get("/home", (req, res) => {
  res.send("Home");
});

app.get("/login", (req, res) => {
  res.send("Login");
});

app.get(
  "/auth/outlook/redirect/",
  passport.authenticate("windowslive", {
    failureRedirect: "/login",
    successRedirect: "/home",
    session: false,
  })
);

app.get(
  "/auth/outlook",
  passport.authenticate("windowslive", {
    scope: ["user.read", "User.Read.All"],
    prompt: "select_account",
  })
);

app.listen(3000, "localhost", () => {
  console.log("server started");
});
