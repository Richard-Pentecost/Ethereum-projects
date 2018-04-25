pragma solidity ^0.4.17;

contract CampaignFactory {
    address[] public deployedCampaigns;
    
    function createCampaign (uint minimum) public {
        minimum = msg.value;
        address newCampaign = new Campaign(minimum, msg.sender);
        deployedCampaigns.push(newCampaign);
    }
    
    function getDeployedContracts() public view returns (address[]) {
        return deployedCampaigns;
    }
}

contract Campaign {
    struct Request {
        string description;
        uint value;
        address recipient;
        bool complete;
        uint approvalCount;
        mapping(address => bool) approvals;
    }
    
    Request[] public requests;
    uint public minimumContribution;
    string public manager;
    mapping(address => bool) public approvers;
    uint public approversCount;
    
    modifier restricted () {
        require(msg.sender == manager);
        _;
    }
    
    function Campaign(uint minimum, address creator) public {
        minimumContribution = minimum;
        manager = creator;
    }
    
    function contribute() public payable {
        require(msg.value > minimumContribution)
        approvers[msg.sender] = true;
        approversCount++;
    }
    
    function createRequest(string description, uint value, address recipient) public restricted {
        Request memory newRequest = Request({
            description: description,
            value: value;
            recipient: recipient;
            complete: false,
            approvalCount; 0
        });
        
        requests.push(newRequest);
    }
    
    function approveRequest(uint index) public {
        Request storage request = requests(index);
        
        require(approvers[msg.sender]);
        require(!approvals[msg.sender]);
        
        request.approvals[msg.sender] = true;
        approvalCount++;        
    }
    
    function finalizeRequest(uint index) public restricted {
        Request storage request = requests(index);
        
        require(request.approalCount > (approversCount / 2));
        require(!request.complete);
        
        request.recipient.transfer(request.value);
        request.complete = true;
    }
    
    function getSummary() public view returns (uint, uint, uint, uint, address) {
        return(
            minimumContribution,
            this.balance,
            approversCount,
            requests.length,
            manager
        );
    }
    
    function getRequestCount() public view returns (uint) {
        return requests.length;
    }
}