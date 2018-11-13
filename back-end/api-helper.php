
<?php 
require 'dbhelper.php';

function connectDB(){
	$server = 'localhost'; // this may be an ip address instead
	$user = 'root';
	$pass = '';
	$database = 'smc_new';
	$connection = new mysqli($server, $user, $pass, $database);

	return $connection;
}

function getAllHandler($fields, $tablename, $request){


	$res_array = array("results"=>array(),"message"=>"","code"=>"");
	
    $db = connectDB();
    if ($db->connect_error) {

        $res_array["message"] = "Connection failed ".$db->connect_error;
        $res_array["code"] = "500";
        return $res_array;
    }
    // form a string to extract the columns provided in input
    $field_string = '';
    foreach ($fields as $field) {
    	$field_string .= $field.',';
    }
    $field_string = substr($field_string, 0, strlen($field_string) - 1);
    
	$query = "select $field_string from $tablename";
    $result = $db->query($query);
    
    while($row = $result->fetch_assoc())
    {
    	$objArray = array();
        foreach ($fields as $field) {
        	$objArray["$field"] = $row["$field"];
	    
    	}
    	array_push($res_array["results"], $objArray);
    }
    $db->close();
    $res_array["message"] = "success";
    $res_array["code"] = "200";
    return $res_array;

}

function getHandler($fields, $id_field, $get_param_name, $tablename, $request){

	$res_array = array("results"=>array(),"message"=>"","code"=>"");
    $id = $request->getAttribute($get_param_name);
    
    $db = connectDB();
    if ($db->connect_error) {

        $res_array["message"] = "Connection failed ".$db->connect_error;
        $res_array["code"] = "error code for connection fail";
        return $res_array;
    }

    $id_present = checkId($db, $tablename, $id_field, $id);
    if($id_present === FALSE)
    {
        $res_array["message"] = "Request failed; Resource with given Id doesn't exist not found";
        $res_array["code"] = "400";
        return $res_array;
    }

    $query = "select * from $tablename where $id_field=$id";
    
    $result = $db->query($query);
    
    
    while($row = $result->fetch_assoc())
    {
        $objArray = array();
        foreach ($fields as $field) {
        	$objArray["$field"] = $row["$field"];
	    
    	}
    	array_push($res_array["results"], $objArray);
    }
    $db->close();
    $res_array["message"] = "success";
    $res_array["code"] = "200";
    return $res_array;
}

function addHelper($req_fields, $id_field, $tablename, $request){

	$res_array = array("results"=>array(),"message"=>"","code"=>"");
    $body = $request->getBody()->getContents();
    $body = (array)json_decode($body);
    
    $token = $request->getAttribute('token');
    $UserId = $token->data->UserId;
    //echo $username;
    $db = connectDB();
    if ($db->connect_error) {

        $res_array["message"] = "Connection failed ".$db->connect_error;
        $res_array["code"] = "error code for connection fail";
        return $res_array;
    }

    // check if every required field to insert is present

    foreach ($req_fields as $field) {
    	if(!isset($body[$field])){  
	        $res_array["message"] = "Request faied; Required field $field not found";
	        $res_array["code"] = "400";
	        return $res_array;   
	    }
    }

    // form a string to extract the columns provided in input
    $field_string = '';
    $value_string = "";
    foreach ($req_fields as $field) {
    	$field_string .= $field.',';
    	$value_string .= '\''.$body[$field].'\','; 
    }
    // for removing the last extra comma (,)
    $field_string = substr($field_string, 0, strlen($field_string) - 1);
    $value_string = substr($value_string, 0, strlen($value_string) - 1);
    
    $CreatedBy = $UserId;
    $ModifyBy = $UserId;
    $CreatedDateTime = (new DateTime("now"))->format(DateTime::ISO8601);
    $ModifyDateTime = (new DateTime("now"))->format(DateTime::ISO8601);

    $query = "insert into $tablename($field_string,CreatedBy,CreatedDateTime,ModifyBy,ModifyDateTime) values($value_string,$CreatedBy,'$CreatedDateTime',$ModifyBy,'$ModifyDateTime')";
    //echo $query;
    $result = $db->query($query);
    
    if($result === TRUE)
    {
        $id = $db->insert_id;
        $result_array[$id_field] = $id;

        foreach ($req_fields as $field) {
        	$result_array["$field"] = $body["$field"];
    	}
    	$result_array["CreatedBy"] = $CreatedBy;
    	$result_array["ModifyBy"] = $ModifyBy;
    	$result_array["CreatedDateTime"] = $CreatedDateTime;
    	$result_array["ModifyDateTime"] = $ModifyDateTime;

        array_push($res_array["results"], $result_array);
        $res_array["message"] = "success";
        $res_array["code"] = "201";
        $db->close();
        return $res_array;
    }
    else
    {
        $res_array["message"] = "Insertion Failed;".$db->error;
        $res_array["code"] = "409";
        $db->close();
        return $res_array;

    }

}

function deleteHelper($get_param_name, $id_field, $tablename, $request){

	$res_array = array("results"=>array(),"message"=>"","code"=>"");
    $id = $request->getAttribute($get_param_name);

    $db = connectDB();
    if ($db->connect_error) {

        $res_array["message"] = $db->connect_error;
        $res_array["code"] = "500";
        return $res_array;
    }

    $id_present = checkId($db, $tablename, $id_field, $id);
    if($id_present === FALSE)
    {
        $res_array["message"] = "Request failed; Resource with given Id doesn't exist not found";
        $res_array["code"] = "400";
        $db->close();
        return $res_array;
    }


    $query = "delete from $tablename where $id_field=$id";
    $result = $db->query($query);

    if($result === TRUE)
    {
        $res_array["message"] = "success";
        $res_array["code"] = "200";
        $db->close();
        return $res_array;
    }    
    else 
    {
        $res_array["message"] = "Request failed; Server error;".$db->error;
        $res_array["code"] = "500";
        $db->close();
        return $res_array;   
    }

}

function updateHelper($req_fields, $id_field, $get_param_name, $tablename, $request){

	$res_array = array("results"=>array(),"message"=>"","code"=>"");
    $body = $request->getBody()->getContents();
    $body = (array)json_decode($body);
    $id = $request->getAttribute($get_param_name);
    
    $token = $request->getAttribute('token');
    $UserId = $token->data->UserId;
    //echo $username;
    $db = connectDB();
    if ($db->connect_error) {

        $res_array["message"] = "Connection failed ".$db->connect_error;
        $res_array["code"] = "error code for connection fail";
        return $res_array;
    }
    
    // check if every required field to insert is present

    foreach ($req_fields as $field) {
    	if(!isset($body[$field])){  
	        $res_array["message"] = "Request faied; Required field $field not found";
	        $res_array["code"] = "400";
	        $db->close();
	        return $res_array;   
	    }
    }

    $id_present = checkId($db, $tablename, $id_field, $id);
    if($id_present === FALSE)
    {
        $res_array["message"] = "Request failed; Resource with given Id doesn't exist not found";
        $res_array["code"] = "400";
        $db->close();
        return $res_array;
    }

    // form the string for editing
    $edit_string = '';
    foreach ($req_fields as $field) {
    	$edit_string .= $field.'='.'\''.$body["$field"].'\',';
    }
    // for removing the last extra comma (,)
    $edit_string = substr($edit_string, 0, strlen($edit_string) - 1);
    
    $ModifyBy = $UserId;
    $ModifyDateTime = (new DateTime("now"))->format(DateTime::ISO8601);

    $query = "update $tablename set $edit_string, ModifyBy=$ModifyBy, ModifyDateTime='$ModifyDateTime' where $id_field=$id";
    $result = $db->query($query);
    
    if($result === TRUE)
    {
        
        $res_array["message"] = "success";
        $res_array["code"] = "200";
        $db->close();
        return $res_array;
    }
    else
    {

        $res_array["message"] = "Request failed; Server error;".$db->error;
        $res_array["code"] = "500";
        $db->close();
        return $res_array;

    }  
}

function getXsByY($x, $y, $x_fields, $y_id_field, $get_param_name, $request){

    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    $y_id = $request->getAttribute($get_param_name);
    
    $db = connectDB();
    if ($db->connect_error) {

        $res_array["message"] = "Connection failed ".$db->connect_error;
        $res_array["code"] = "error code for connection fail";
        return $res_array;
    }

    $id_present = checkId($db, $y, $y_id_field, $y_id);
    if($id_present === FALSE)
    {
        $res_array["message"] = "Request failed; Resource with given Id doesn't exist not found";
        $res_array["code"] = "400";
        return $res_array;
    }

    // form string for query
    $field_string = '';
    foreach ($x_fields as $field) {
    	$field_string .= $field.',';
    }
    // for removing the last coma
    $field_string = substr($field_string, 0, strlen($field_string) - 1);

    $query = "select $field_string from $x where $y_id_field=$y_id";
    $result = $db->query($query);
    
    while($row = $result->fetch_assoc())
    {   
		$objArray = array();
        foreach ($x_fields as $field) {
        	$objArray["$field"] = $row["$field"];
	    
    	}
    	array_push($res_array["results"], $objArray);            

    }
    $db->close();
    $res_array["message"] = "success";
    $res_array["code"] = "200";
    return $res_array; 

}




?>