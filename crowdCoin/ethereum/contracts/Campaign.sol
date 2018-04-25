pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    // creates new campaign that requires minimum contribution input
    function createCampaign(uint minimum) public {
        // creates a new campaign by calling the Campaign function in the 
        // Campaign contract and recieves the address of it
        address newCampaign = new Campaign(minimum, msg.sender);
        // adds the new campaigns address to the the list of campaigns
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedCampaigns() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request{
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    Request[] public requests;
    address public manager;
    uint public minimumContribution;
    mapping(address => bool) public approvers;
    uint public approversCount;
    
    // modifier to check that manager has sent request
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    // function creates the campaign, requiring a value for minimum
    // contribution to be set
    function Campaign(uint minimum, address creator) public {
        // person who owns the contract
        manager = creator;
        // manager sets the minimum contribution
        minimumContribution = minimum;
    }

    // function allows someone to contribute, making sure thate their
    // contribution is greater than the minimum set
    function contribute() public payable {
        // checks to make sure the contribution is greater than the set minimum
        require(msg.value > minimumContribution);
        // adds contributor to the approvers list (address doesn't get stored, just the boolean) 
        approvers[msg.sender] = true;
        approversCount++;
    }

    // function creates a request from the manager for the approvers to vote on     
    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory newRequest = Request({     
            description: description,
            value: value,
            recipient: recipient,
            complete: false,
            approvalCount: 0
        });
        // equivalent to the above - Request(description, value, recipient, false);
         
        // adds new request to the requests array
        requests.push(newRequest);
    }
    
    // function an approver calls to approve/disapprove an indexed spending request
    function approveRequest(uint index) public {
        Request storage request = requests[index];
        
        // check that person is an approver and hasn't already voted on this request
        require(approvers[msg.sender]);
        require(!request.approvals[msg.sender]);
        
        // updates request array so approver can't vote again
        request.approvals[msg.sender] = true;
        // increment approvalCount
        request.approvalCount++;
    }
    
    // function allows manager to finalize the request
    function finalizeRequest(uint index) public restricted {
        Request storage request = requests[index];
        
        require(request.approvalCount > (approversCount / 2));
        require(!request.complete);
        
        request.recipient.transfer(request.value);
        request.complete = true;
    }
    
    function getSummary() public view returns (
        uint, uint, uint, uint, address
    ) {
        return (
            minimumContribution,
            this.balance,
            requests.length,
            approversCount,
            manager
        );
    }
    
    function getRequestsCount() public view returns (uint) {
        return requests.length;
    }
}
