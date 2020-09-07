import React from "react";
import Maker from "@makerdao/dai";
import { McdPlugin } from "@makerdao/dai-plugin-mcd";
import ethers from "ethers";
import "../assets/stylesheets/content.scss";
import gelatoLogo from "../assets/images/gelato_logo_white.png";
import GelatoCoreLib from "@gelatonetwork/core";

import GelatoManagerAbi from "../abis/gelatoManager.json";
import ChainLinkOracleAbi from "../abis/chainlinkGasOracle.json";

class Content extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      yETH: null,
      amount: 0.1,
    };

    this.fetchCdpData = this.fetchCdpData.bind(this);
    this.donate = this.donate.bind(this);
    this.updateDonationAmount = this.updateDonationAmount.bind(this);
    this.getYelatoBalance = this.getYelatoBalance.bind(this);
  }

  async componentDidMount() {
    const maker = await Maker.create("http", {
      plugins: [McdPlugin],
      url: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
    });

    const provider = ethers.getDefaultProvider("homestead");

    const gelato = new ethers.Contract(
      process.env.REACT_APP_GELATO_CORE,
      GelatoCoreLib.GelatoCore.abi,
      provider
    );

    this.setState({
      gelatoCore: gelato,
    });

    this.getYelatoBalance();

    setTimeout(async () => {
      this.getYelatoBalance();
    }, 60000);

    const manager = await maker.service("mcd:cdpManager");

    this.fetchCdpData(manager);

    setTimeout(() => {
      this.fetchCdpData(manager);
    }, 60000);
  }

  async fetchCdpData(manager) {
    const yETHVault = await manager.getCdp(13972);

    this.setState({
      yETH: yETHVault,
    });
  }

  async donate() {
    const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();

    const yelato = new ethers.Contract(
      process.env.REACT_APP_YELATO_CONTRACT,
      GelatoManagerAbi,
      signer
    );

    const amount = ethers.utils.parseUnits(this.state.amount.toString());

    await yelato.provideFunds({ value: amount }).catch((error) => {
      console.log("user rejected transaction", error);
    });
  }

  async getYelatoBalance() {
    const { gelatoCore } = this.state;

    const balance = await gelatoCore.providerFunds(process.env.REACT_APP_YELATO_CONTRACT);

    const gelatoGasPriceOracleAddress = await gelatoCore.gelatoGasPriceOracle();
    const gelatoGasPriceOracle = await new ethers.Contract(
      gelatoGasPriceOracleAddress,
      ChainLinkOracleAbi,
      ethers.getDefaultProvider("homestead")
    );
    const gelatoGasPrice = await gelatoGasPriceOracle.latestAnswer();

    this.setState({
      yelatoBalance: balance,
      gelatoGasPrice: gelatoGasPrice,
    });
  }

  updateDonationAmount(event) {
    this.setState({
      amount: event.target.value,
    });
  }

  render() {
    const { yETH } = this.state;
    const { web3 } = this.props;

    return (
      <div className="content container">
        <h1 className="heading mb-6">yETH Vault</h1>

        <div className="level vault-data">
          {yETH && (
            <>
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Collateralization Ratio</p>
                  <p className="title">
                    {yETH.collateralValue
                      .div(yETH.debtValue)
                      .mul(100)
                      .toString()
                      .replace("USD/DAI", " ")}
                    %
                  </p>
                </div>
              </div>
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Vault Value</p>
                  <p className="title">
                    ${yETH.collateralValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              </div>
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Outstanding Debt Value</p>
                  <p className="title">
                    {yETH.debtValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              </div>
              <div className="level-item has-text-centered">
                <div>
                  <p className="heading">Liquidation Price</p>
                  <p className="title">
                    ${yETH.liquidationPrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              </div>
            </>
          )}

          {!yETH && (
            <progress className="progress is-large" max="100">
              80%
            </progress>
          )}
        </div>

        {this.state.yelatoBalance && (
          <div className="level">
            <div className="level-item has-text-centered gelato-data">
              Transactions Balance:{" "}
              <span className="highlight-balance mx-1">
                {ethers.utils.formatEther(this.state.yelatoBalance)}
              </span>{" "}
              ETH
            </div>

            <div className="level-item has-text-centered gelato-data">
              Chainlink Gas Price:{" "}
              <span className="highlight-balance mx-1">
                {ethers.utils.formatUnits(this.state.gelatoGasPrice.toString(), "gwei")}
              </span>{" "}
              GWEI
            </div>

            <div className="level-item has-text-centered gelato-data">
              Transaction Cost:{" "}
              <span className="highlight-balance mx-1">
                {ethers.utils.formatEther(this.state.gelatoGasPrice.mul("1200000"))}
              </span>{" "}
              ETH
            </div>

            <div className="level-item has-text-centered gelato-data">
              Transactions Remaining:{" "}
              <span className="highlight-balance mx-1">
                {this.state.yelatoBalance.div(this.state.gelatoGasPrice.mul("1200000")).toString()}
              </span>{" "}
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-content">
            <p className="title">
              Donate to support the automatic liquidation protection. Funds will exclusively be used
              to cover the transaction fees when wiping debt of the yETH vault.
            </p>

            <div>
              <input
                type="number"
                min="0.01"
                step="0.01"
                onChange={this.updateDonationAmount}
                className="donation-input mb-2"
                value={this.state.amount}
              />
            </div>

            <button className="call-to-action mb-6" disabled={!web3} onClick={this.donate}>
              Donate ETH
            </button>

            <p>
              Powered by:{" "}
              <a href="https://gelato.network">
                <img src={gelatoLogo} className="gelato-logo" alt="gelato network" />
                Gelato Network
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }
}

export default Content;
