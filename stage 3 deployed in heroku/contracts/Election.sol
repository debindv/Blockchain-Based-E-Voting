pragma solidity >=0.4.22  <0.7.0;

//declare contract
contract Election {
    //model a candidate
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }
    string Question; //Question
    address EventAdmin;
    uint256 constant NULL = 0;
    string Qst;
    //store accounts that have voted
    mapping(address => bool) public voters;
    mapping (string => bool) public voted;
    //store candidate
    //fetch candidate
    mapping(uint =>Candidate) public candidates; //mapping is an associative array r a hash associative key value pairs with one another
    //store candidates Count
    uint public candidatesCount;
    string public candidate;
    modifier onlyOwner {
        require(msg.sender == EventAdmin,'No access');
        _;
    }

    //constructor
    constructor () public {
        addCandidate("NOTA");
        EventAdmin = msg.sender;
    }
    function setQuestion(string memory theQuestion) public{
        if(bytes(Qst).length == 0 )
        {
            Question = theQuestion;
            Qst = Question;
        }
    }
    function getCandidate (uint _candidateId) public view returns (uint _id, string memory _name, uint _voteCount) {
        _id = candidates[_candidateId].id;
        _name = candidates[_candidateId].name;
        _voteCount = candidates[_candidateId].voteCount;
    }
    function getQuestion() public view returns(string memory) {
        return Question;
    }
    function addCandidate (string memory _name) public { // private because not too be accessible by public interface of contract
        candidatesCount ++;
        candidates[candidatesCount] = Candidate({id: candidatesCount, name: _name, voteCount:0} );
    }
    function vote (uint _candidateId, string memory _mailId) public {
        //user haven't voted before
        //require(!voters[msg.sender],'User have voted before!!');
        require(!voted[_mailId], 'User have voted before!!');
        //valid candidate
        require(_candidateId > 0 && _candidateId <= candidatesCount,'Invalid candidate');
        voters[msg.sender] = true;
        voted[_mailId] = true;
        candidates[_candidateId].voteCount ++;
    }
    function hasVoted (string memory _mailId) public view returns (bool _voted) {
        _voted = voted[_mailId];
    }
}