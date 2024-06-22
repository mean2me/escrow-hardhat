// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Escrow {
  enum Status {
    APPROVED,
    WAITING_FOR_APPROVAL,
    FUNDS_RETURNED
  }

	address public arbiter;
	address public beneficiary;
	address public depositor;
  uint public immutable expiresAt;
  Status public status = Status.WAITING_FOR_APPROVAL;

	bool public isApproved;

	event Approved(uint indexed amount);

  error FundsReturned();
  error NotAllowed(address escrowAddress);
  error NotExpired();

  modifier onlyArbiter() {
    if(msg.sender != arbiter) {
      revert NotAllowed(address(this));
    }
    _;
  }

  modifier onlyDepositor() {
    if(msg.sender != depositor) {
      revert NotAllowed(address(this));
    }
    _;
  }

  modifier notExpired() {
    if(block.timestamp < expiresAt) {
      revert NotExpired();
    }
    _;
  }

  modifier notReturned() {
    if(status == Status.FUNDS_RETURNED) {
      revert FundsReturned();
    }
    _;
  }

	constructor(address _arbiter, address _beneficiary) payable {
		arbiter = _arbiter;
		beneficiary = _beneficiary;
		depositor = msg.sender;
    expiresAt = block.timestamp + 1 weeks;
	}

	function approve() external onlyArbiter notReturned {
		uint balance = address(this).balance;
		(bool sent, ) = payable(beneficiary).call{value: balance}("");
 		require(sent, "Failed to send Ether");
		emit Approved(balance);
		isApproved = true;
	}

  function returnFunds() public onlyDepositor notExpired {
    (bool success, ) = payable(msg.sender).call{value:address(this).balance}("");
    require(success, "Return failed");
    status = Status.FUNDS_RETURNED;
  }
}
