    // SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleDex is Ownable {
    IERC20 public tokenA;
    IERC20 public tokenB;
    /**
        @notice Emitted when liquidity is added to the pool.
        @param provider The address of the provider who adds liquidity.
        @param amountA The amount of tokenA added to the liquidity pool.
        @param amountB The amount of tokenB added to the liquidity pool.
    */
    event LiquidityAdded(address indexed provider, uint256 amountA, uint256 amountB);
    /**
        @notice Emitted when liquidity is removed from the pool.
        @param provider The address of the provider who removes liquidity.
        @param amountA The amount of tokenA removed from the liquidity pool.
        @param amountB The amount of tokenB removed from the liquidity pool.
    */
    event LiquidityRemoved(address indexed provider, uint256 amountA, uint256 amountB);
    /**
        @notice Emitted when a swap occurs between tokenA and tokenB.
        @param user The address of the user who performs the swap.
        @param amountIn The amount of input token (either tokenA or tokenB) that was swapped.
        @param amountOut The amount of output token (either tokenA or tokenB) received after the swap.
        @param direction A string that indicates the swap direction. 
                        ("SwapAforB" for tokenA to tokenB swap, "SwapBforA" for tokenB to tokenA swap).
    */
    event Swapped(address indexed user, uint256 amountIn, uint256 amountOut, string direction);

    /**
        @notice Constructor for the SimpleDEX contract.
        @param _tokenA The address of the tokenA contract that will be used in the DEX.
        @param _tokenB The address of the tokenB contract that will be used in the DEX.
        
        @dev This constructor initializes the contract with the addresses of tokenA and tokenB to be used in the DEX.
            It also sets the owner of the contract as the account deploying the contract.
    */
    constructor(address _tokenA, address _tokenB) Ownable(msg.sender) {
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    /**
        @notice Add liquidity to the pool. Only accessible by the owner.

        @param amountA  **_amountA** The amount of tokenA to add.
        @param amountB  **_amountB** The amount of tokenB to add.

        @dev This function allows the owner to add liquidity to the pool. 
             Both `amountA` and `amountB` must be greater than zero.
    */ 
    function addLiquidity(uint256 amountA, uint256 amountB) public onlyOwner {
        require(amountA > 0 && amountB > 0, "Invalid amounts");

        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);

        emit LiquidityAdded(msg.sender, amountA, amountB);
    }

    /**
        @notice Remove liquidity from the pool. Only accessible by the owner.

        @param amountA  **_amountA** The amount of tokenA to remove.
        @param amountB  **_amountB** The amount of tokenB to remove.

        @dev This function allows the owner to remove liquidity from the pool. 
             The amount of tokens removed cannot exceed the pool's reserves.
    */ 
    function removeLiquidity(uint256 amountA, uint256 amountB) public onlyOwner {
        uint256 reserveA = tokenA.balanceOf(address(this));
        uint256 reserveB = tokenB.balanceOf(address(this));
        require(amountA <= reserveA && amountB <= reserveB, "Not enough liquidity");

        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);

        emit LiquidityRemoved(msg.sender, amountA, amountB);
    }

    /** 
        @notice Swap TokenA for TokenB. User sends tokenA to receive tokenB.

        @param amountAIn  **_amountAIn** The amount of tokenA to swap.

        @dev This function allows users to swap tokenA for tokenB. 
             `amountAIn` must be greater than zero.
    */
    function swapAforB(uint256 amountAIn) public {
        require(amountAIn > 0, "Invalid amount");

        uint256 amountBOut = getAmountOut(amountAIn, tokenA.balanceOf(address(this)), tokenB.balanceOf(address(this)), true);
        tokenA.transferFrom(msg.sender, address(this), amountAIn);
        tokenB.transfer(msg.sender, amountBOut);
        emit Swapped(msg.sender, amountAIn, amountBOut, "SwapAforB");
    }


    /** 
        @notice Swap TokenB for TokenA. User sends tokenB to receive tokenA.

        @param amountBIn  **_amountBIn** The amount of tokenB to swap.

        @dev This function allows users to swap tokenB for tokenA. 
             `amountBIn` must be greater than zero.
    */
    function swapBforA(uint256 amountBIn) public {
        require(amountBIn > 0, "Invalid amount");

        uint256 amountAOut = getAmountOut(amountBIn, tokenB.balanceOf(address(this)), tokenA.balanceOf(address(this)), false);
        tokenB.transferFrom(msg.sender, address(this), amountBIn);
        tokenA.transfer(msg.sender, amountAOut);
        emit Swapped(msg.sender, amountBIn, amountAOut, "SwapBforA");
    }
    /**
        @notice Get the price of a token in terms of the other token.

        @param _token  **_token** The address of the token for which to get the price.

        @dev This function calculates the price of a token by dividing the 
             reserve of the other token by the reserve of the requested token.

        @return price The calculated price of the token.
    */
    function getPrice(address _token) public view returns (uint256) {
        address tokenAAddress = address(tokenA);
        address tokenBAddress = address(tokenB);

        uint256 reserveA = tokenA.balanceOf(address(this));
        uint256 reserveB = tokenB.balanceOf(address(this));

        require(_token == tokenAAddress || _token == tokenBAddress, "Invalid token address");

        if (_token == tokenAAddress) {
            return reserveB / reserveA;
        } else {
            return reserveA / reserveB;
        }
    }
     /**
        @notice Calculates the amount of output token to be received in a swap.
        
        @param amountIn  **_amountIn** The amount of input token for the swap.
        @param reserveTokenA  **_reserveTokenA** The current reserve of tokenA.
        @param reserveTokenB  **_reserveTokenB** The current reserve of tokenB.
        @param isAforB  **_isAforB** A boolean indicating if it's a swap from TokenA to TokenB (true) or TokenB to TokenA (false).
        
        @dev This function calculates the amount of output token (TokenA or TokenB) based on the input amount and reserves.
             It uses a simplified constant product formula for AMM swaps.
        
        @return amountOut  The amount of output token received.
    */
    function getAmountOut(uint256 amountIn, uint256 reserveTokenA, uint256 reserveTokenB,bool isAforB) internal pure returns (uint256) {
        require(amountIn > 0, "Invalid amount");
        if (isAforB) {
            return reserveTokenB - (reserveTokenA * reserveTokenB) / (reserveTokenA + amountIn);
        } else {
            return (reserveTokenA * reserveTokenB) / (reserveTokenB - amountIn) - reserveTokenA;
        }
    }

    /**
        @notice Retrieves the current reserves of tokens held by the contract.
        
        @dev This function returns the balance of tokenA and tokenB in the contract.
            It is a view function and does not modify the state.
        
        @return reserveA  The current balance of tokenA in the contract.
        @return reserveB  The current balance of tokenB in the contract.
    */
    function getReserves() public view returns (uint256, uint256) {
        uint256 reserveA = tokenA.balanceOf(address(this));
        uint256 reserveB = tokenB.balanceOf(address(this));
        return (reserveA, reserveB);
    }

}