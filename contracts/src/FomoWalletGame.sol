// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FomoWalletGame {
    struct Game {
        address host;
        uint256 targetNumber;
        uint256 deadline;
        address winner;
        uint256 winningGuess;
        bool finalized;
        bool exists;
        uint256 guessCount;
    }

    struct Guess {
        uint256 guess;
        bool exists;
    }

    uint256 public gameCounter;
    mapping(uint256 => Game) public games;
    mapping(uint256 => mapping(address => Guess)) public guesses;
    mapping(uint256 => address[]) public guessers;

    event GameCreated(uint256 indexed gameId, address indexed host, uint256 deadline);
    event GuessPlaced(uint256 indexed gameId, address indexed player, uint256 guess, string hint);
    event GameFinalized(uint256 indexed gameId, address indexed winner, uint256 winningGuess, uint256 targetNumber);

    function createGame(uint256 _targetNumber, uint256 _durationSeconds) external returns (uint256) {
        require(_durationSeconds > 0, "Duration must be > 0");
        gameCounter++;
        uint256 gameId = gameCounter;
        games[gameId] = Game({
            host: msg.sender,
            targetNumber: _targetNumber,
            deadline: block.timestamp + _durationSeconds,
            winner: address(0),
            winningGuess: 0,
            finalized: false,
            exists: true,
            guessCount: 0
        });
        emit GameCreated(gameId, msg.sender, games[gameId].deadline);
        return gameId;
    }

    function placeGuess(uint256 _gameId, uint256 _guess) external {
        Game storage game = games[_gameId];
        require(game.exists, "Game does not exist");
        require(block.timestamp < game.deadline, "Game expired");
        require(!guesses[_gameId][msg.sender].exists, "Already guessed");

        guesses[_gameId][msg.sender] = Guess({guess: _guess, exists: true});
        guessers[_gameId].push(msg.sender);
        game.guessCount++;

        string memory hint = getHintInternal(_gameId, _guess);
        emit GuessPlaced(_gameId, msg.sender, _guess, hint);
    }

    function getHint(uint256 _gameId, uint256 _guess) external view returns (string memory) {
        require(games[_gameId].exists, "Game does not exist");
        return getHintInternal(_gameId, _guess);
    }

    function getPlayerHint(uint256 _gameId, address _player) external view returns (string memory) {
        require(games[_gameId].exists, "Game does not exist");
        Guess storage g = guesses[_gameId][_player];
        require(g.exists, "No guess");
        return getHintInternal(_gameId, g.guess);
    }

    function getPlayerGuess(uint256 _gameId, address _player) external view returns (uint256, bool) {
        Guess storage g = guesses[_gameId][_player];
        return (g.guess, g.exists);
    }

    function getGameState(uint256 _gameId)
        external
        view
        returns (
            address host,
            uint256 targetNumber,
            uint256 deadline,
            address winner,
            uint256 winningGuess,
            bool finalized,
            bool exists,
            uint256 guessCount
        )
    {
        Game storage game = games[_gameId];
        return (
            game.host,
            game.targetNumber,
            game.deadline,
            game.winner,
            game.winningGuess,
            game.finalized,
            game.exists,
            game.guessCount
        );
    }

    function finalizeGame(uint256 _gameId) external {
        Game storage game = games[_gameId];
        require(game.exists, "Game does not exist");
        require(block.timestamp >= game.deadline, "Game not ended");
        require(!game.finalized, "Already finalized");

        game.finalized = true;
        address winner = address(0);
        uint256 bestGuess = 0;
        uint256 bestDiff = type(uint256).max;

        address[] storage players = guessers[_gameId];
        uint256 target = game.targetNumber;

        for (uint256 i = 0; i < players.length; i++) {
            Guess storage g = guesses[_gameId][players[i]];
            if (!g.exists) continue;

            uint256 diff = g.guess > target ? g.guess - target : target - g.guess;
            if (diff < bestDiff) {
                bestDiff = diff;
                winner = players[i];
                bestGuess = g.guess;
            }
        }

        game.winner = winner;
        game.winningGuess = bestGuess;

        emit GameFinalized(_gameId, winner, bestGuess, target);
    }

    function getHintInternal(uint256 _gameId, uint256 _guess) internal view returns (string memory) {
        uint256 target = games[_gameId].targetNumber;
        if (_guess == target) return "Exact match!";
        uint256 diff = _guess > target ? _guess - target : target - _guess;
        if (diff <= 5) return "Very close!";
        if (diff <= 20) return "Getting closer";
        if (_guess > target) return "Too high";
        return "Too low";
    }
}
