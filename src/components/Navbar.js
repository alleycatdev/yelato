import React from "react";

import "../assets/stylesheets/navbar.scss";
import logo from "../assets/images/gelato_logo_white.png";

class Navbar extends React.Component {
  render() {
    const { web3 } = this.props;

    return (
      <nav className="level container">
        <div className="level-left">
          <div className="level-item">
            <h1>
              <img src={logo} className="logo" alt="yelato gelato logo" />
              Yelato
            </h1>
          </div>
        </div>

        <div className="level-right">
          <p className="level-item">
            {!web3 && (
              <button className="call-to-action jiggle" onClick={this.props.connectWallet}>
                Connect Wallet
              </button>
            )}

            {web3 && web3.provider.networkVersion !== "1" && (
              <button
                className="call-to-action jiggle"
                onClick={this.props.connectWallet}
                disabled="true"
              >
                Please Switch to Mainnet
              </button>
            )}

            {web3 && web3.provider.networkVersion === "1" && (
              <button className="connected-wallet" onClick={this.props.disconnectWallet}>
                <span className="connected-icon"></span>{" "}
                {web3.provider.selectedAddress.slice(0, 8).concat("...")}
              </button>
            )}
          </p>
        </div>
      </nav>
    );
  }
}

export default Navbar;
