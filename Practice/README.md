# Codingame
Problem solving practices
# # Computational complexity (Bender - Episode 3)
 Using performance measures carried out on the execution time of the programs, the goal is to determine the most likely computational complexity from a family of fixed and known algorithmic complexities.
 
 Solution :
 Using the Pearson's correlation coefficient (PCC) to measure linear correlation between two arrays of data (X, Y).
 the PCC is calculated for different pairs:
 * (X, Y) 
 * (X^2, Y) 
 * (X^3, Y) 
 * (Log(X), Y) 
 * (X * Log(X), Y) 
 * (X^2 * Log(X), Y) 
 * (X^3 * Log(X), Y) 
 * (2^X, Y)
 
the best correlation defines the most probable computational complexity among the following possibilities: 
O(1), O(log n), O(n), O(n log n), O(n^2), O(n^2 log n), O(n^3), O(2^n)

# # BFS-Graph (SKYNET REVOLUTION EP1)

This problem plays out on a graph where a “virus” moves from node to node, in search of an exit. 
There are several exits and you have to cut access to these exits by finding the best link to cut each turn.

implementing the solution helped me to improve these skills :
Storing data in a graph data structure. Searching through and updating the graph with the BFS algo.
