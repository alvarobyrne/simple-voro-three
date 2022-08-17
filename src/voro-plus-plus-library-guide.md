# geting vertices and indices for each cell

```c++
	const char *absolute_points = "%P";
	con.print_custom(absolute_points, "vertices.txt");
	const char *indices = "%t";
	con.print_custom(indices, "indices.txt");
```

refer to [Voro++ customized output reference](https://math.lbl.gov/voro++/doc/custom.html)
