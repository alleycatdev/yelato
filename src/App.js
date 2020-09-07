import React from "react";
import Web3Modal from "web3modal";
import ethers from "ethers";
import WalletConnectProvider from "@walletconnect/web3-provider";
import GelatoCoreLib from "@gelatonetwork/core";
import "./assets/stylesheets/app.scss";

// Components
import Navbar from "./components/Navbar.js";
import Content from "./components/Content.js";

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      walletInitialized: false,
      web3: null,
    };

    this.connectWallet = this.connectWallet.bind(this);
    this.disconnectWallet = this.disconnectWallet.bind(this);
    this.getYelatoBalance = this.getYelatoBalance.bind(this);
  }

  async connectWallet() {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: process.env.REACT_APP_INFURA_PROJECT_ID, // required
        },
      },
    };

    const web3Modal = new Web3Modal({
      network: "mainnet", // optional
      providerOptions, // required
    });

    const provider = await web3Modal.connect(window.ethereum);

    const web3 = new ethers.providers.Web3Provider(provider);

    const gelato = new ethers.Contract(
      process.env.REACT_APP_GELATO_CORE,
      GelatoCoreLib.GelatoCore.abi,
      web3
    );

    this.setState({
      web3: web3,
      provider: provider,
      walletInitialized: true,
      gelatoCore: gelato,
    });

    this.getYelatoBalance();

    setTimeout(() => {
      this.getYelatoBalance();
    }, 60000);
  }

  async disconnectWallet() {
    if (this.state.provider.close) {
      await this.state.provider.close();
    }

    this.setState({
      web3: null,
      provider: null,
      walletInitialized: false,
    });
  }

  async getYelatoBalance() {
    const balance = await this.state.gelatoCore.providerFunds(
      process.env.REACT_APP_YELATO_CONTRACT
    );

    this.setState({
      yelatoBalance: balance,
    });
  }

  render() {
    return (
      <div className="app-root">
        <Navbar
          {...this.state}
          connectWallet={this.connectWallet}
          disconnectWallet={this.disconnectWallet}
        />

        <Content {...this.state} />
      </div>
    );
  }
}

export default App;
