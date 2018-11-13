# SADD-System-for-automated-data-funneling
Current scenario:
The current problem is regarding creation and maintenance of API which handles this data.Every time a new kind of data source comes in, a new API is to be written to handle it.

Providing time efficient solution:
Creating a platform neutral Middleware which handles all kinds of Data from various heterogeneous data sources with the following key properties.

-- Reconfigurable and hence easy to maintain
-- To be extended to meet changing needs
-- Will facilitate Open Data initiative of the City

Middleware would be a central place to handle all database related tasks.

Software design principles followed:
MVC architecture followed to make system more flexible to future changes.

Regarding files:
Each related files will be found in folders which are named according to its functionality.
