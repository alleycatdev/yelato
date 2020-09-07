import React from "react";

import "../assets/stylesheets/footer.scss";

class Footer extends React.Component {
  render() {
    return (
      <footer>
        <div className="level">
          <div className="level-item ">
            <p>
              <a
                href="https://github.com/gelatodigital/yearn-saver"
                rel="noopener noreferrer"
                target="_blank"
              >
                Github
              </a>
            </p>
          </div>
          <div className="level-item">
            <p>
              <a
                href="https://etherscan.io/address/0x20C45334e4035AE411655eF7360116Cf627e4d06"
                target="_blank"
                rel="noopener noreferrer"
              >
                Etherscan
              </a>
            </p>
          </div>
          <div className="level-item">
            <p>
              <a
                href="https://t.me/joinchat/HcTaOxJ0_FjU-r34vbvK8A"
                target="_blank"
                rel="noopener noreferrer"
              >
                Telegram
              </a>
            </p>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
