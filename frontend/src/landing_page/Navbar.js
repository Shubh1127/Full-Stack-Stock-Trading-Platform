import React from "react";
import { Link } from "react-router-dom";
function Navbar() {
  return (
    
      <nav class="navbar navbar-expand-lg  border-bottom  bg-body-tertiary " style={{backgroundColor:"#fff",width:"100%"}}>
        <div class="container p-3">
          <Link class="navbar-brand" to="/">
            <h3 style={{marginRight:"35vw",color:"#1c90e3"}}>TradeWave</h3>
          </Link>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarSupportedContent">
           
            <form class="d-flex" role="search">
            <ul className="navbar-nav d-felx justify-content-between  me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                <Link class="nav-link active" aria-current="page" to="/signup">
                  Signup
                </Link>
              </li>
              <li class="nav-item">
                <Link class="nav-link active" to="/about">
                  About
                </Link>
              </li> 
              <li class="nav-item">
                <Link class="nav-link active" to="/product">
                  Products
                </Link>
              </li> 
              <li class="nav-item">
                <Link class="nav-link active" to="/pricing">
                  Pricing
                </Link>
              </li> 
              <li className="nav-item  ">
                <Link className="nav-link active" to="support">
                  Support 
                </Link>
              </li> 
            </ul>
            </form>
          </div>
        </div>
      </nav>
     
  );
}

export default Navbar;
