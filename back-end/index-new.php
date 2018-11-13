<?php

date_default_timezone_set("Asia/Kolkata"); // FOR SETTING THE TIME ZONE OF THE SERVER SO THAT PROPER TIME IS UPDATED IN DB

require 'vendor/autoload.php';
require 'api-helper.php';

error_reporting(E_ERROR | E_PARSE); // FOR DISABLING THE WARNINGS

use \Psr\Http\Message\ServerRequestInterface as Request;
use \Psr\Http\Message\ResponseInterface as Response;
use \Firebase\JWT\JWT;
use \Tuupola\Base62;



// for setting up the method for routes that doesn't exist =======START=============

$c = new \Slim\Container(); //Create Your container

//Override the default Not Found Handler
$c['notFoundHandler'] = function ($c) {
    return function ($request, $response) use ($c) {
        $res_array = array("results"=>array(),"message"=>"","code"=>"");
        $res_array["message"] = "Wrong path; resource doesn't exist";
        $res_array["code"] = "404";
        return $c['response']
            ->withJson($res_array, 404);
    };
};
// for setting up the method for routes that doesn't exist =======END  =============


$app = new \Slim\App($c);

// =================== For Authentication ================== START ===================
$app->add(new \Slim\Middleware\JwtAuthentication([
    "secret" => "your_secret_key",
    "path" => "/",
    "passthrough" => ["/login"] // we dont require a token for this path, others all require a valid unexpired token
]));
// =================== For Authentication ================== END   ===================

// $app->error(function (\Exception $e) use ($app) {
//     //enter manipulation of $e->getTrace()
//     //or just var_dump($e->getTrace()) but the format would be chaotic
//     var_dump($e->getTrace());
// });

/*

==================================================================
==================  APIs ============================== START ====
==================================================================

*/

// Authentication 
$app->get('/login','login');

// Departments Basic
$app->get('/departments','getDepartments');
$app->post('/departments','addDepartment');
$app->delete('/departments/{departmentId}','deleteDepartment');
$app->put('/departments/{departmentId}', 'updateDepartment');
$app->get('/departments/{departmentId}','getDepartment'); 
// Departments Connections
$app->get('/departments/{departmentId}/projects', 'getProjectsByDepartment');
$app->get('/departments/{departmentId}/subdepartments', 'getSubDepartmentsByDepartment');

// SubDepartments Basic
$app->get('/subdepartments', 'getSubDepartments');
$app->get('/subdepartments/{subDepartmentId}', 'getSubDepartment');
$app->post('/subdepartments', 'addSubDepartment');
$app->delete('/subdepartments/{subDepartmentId}', 'deleteSubDepartment');
$app->put('/subdepartments/{subDepartmentId}', 'updateSubDepartment');
// SubDepartment Connections
$app->get('/subdepartments/{subDepartmentId}/projects', 'getProjectsBySubDepartment');

// Projects Basic
$app->get('/projects', 'getProjects');
$app->get('/projects/{projectId}', 'getProject');
$app->post('/projects', 'addProject');
$app->delete('/projects/{projectId}', 'deleteProject');
$app->put('/projects/{projectId}', 'updateProject');
// Projects Connections 
$app->get('/projects/{projectId}/api-requests', 'getAPIRequestsByProject');

// API Request Basics
$app->get('/api-requests', 'getAPIRequests');
$app->get('/api-requests/{apiRequestId}', 'getAPIRequest');
$app->post('/api-requests', 'addAPIRequest');
$app->delete('/api-requests/{apiRequestId}', 'deleteAPIRequest');
$app->put('/api-requests/{apiRequestId}', 'updateAPIRequest');
// API Request Connections
$app->get('/api-requests/{apiRequestId}/attributes', 'getResultAttributesByAPIRequest');
$app->get('/api-requests/{apiRequestId}/mappings', 'getMappingsByAPIRequest');

// Attribute Basics
$app->get('/attributes/{attributeId}', 'getAttribute');
$app->get('/attributes/{attributeId}/mappings', 'getMappingsByAttribute');

// Frequency Basics

$app->get('/frequencies', 'getFrequencies');

//Mappings basics
$app->post('/mappings', 'addMapping');
$app->delete('/mappings/{mappingId}', 'deleteMapping');

// utility apis

$app->post('/databases', 'getDBs');
$app->post('/tables', 'getTables');
$app->post('/columns', 'getColumns');

$app->post('/check-server-url', 'checkServerURL');
$app->post('/check-server-all', 'checkServerAll');

$app->get('/test', 'test');
/*

==================================================================
==================  APIs ============================== END   ====
==================================================================

*/






function login(Request $request, Response $response)
{
    $username = ""; $password = "";
    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    if($request->hasHeader("PHP_AUTH_USER") && $request->hasHeader("PHP_AUTH_PW"))
    {
        // authorisation header is present
        $username = $request->getHeader("PHP_AUTH_USER")[0];
        $password = sha1($request->getHeader("PHP_AUTH_PW")[0]);

        // check if this are correct credentials
        $db = connectDB();
        if ($db->connect_error) {

            $res_array["message"] = "Connection failed ".$db->connect_error;
            $res_array["code"] = "error code for connection fail";
            return $response->withJson($res_array);
        }

        $statement = $db->prepare("select * from users where Username=? and Password=?");
        $statement->bind_param('ss', $username, $password);
        $executed = $statement->execute();
        $result = $statement->get_result();

        if($result->num_rows == 1)
        {
            //authenticated ... generate a token and give it back
            $row = $result->fetch_assoc();
            $now = new DateTime();
            $future = new DateTime();
            $expire = new DateTime("now +30 days");
            $jti = base64_encode(mcrypt_create_iv(32));

            $secret = "your_secret_key";

            $payload = [
                "jti" => $jti,
                "iat" => $now->getTimeStamp(),
                "nbf" => $future->getTimeStamp(),
                "exp" => $expire->getTimeStamp(),
                "data" => [
                    "Username" => $username,
                    "UserId" => $row["UserId"]
                ]

            ];

            $token = JWT::encode($payload, $secret, "HS256");
            array_push($res_array["results"], array("username"=>$username, "token"=> $token));
            $res_array["message"] = "success";
            $res_array["code"] = "200";
            return $response->withJson($res_array);
        }
        else
        {
            // not authenticated
            $res_array["message"] = "Credentials invalid";
            $res_array["code"] = "error code for invalid credentials";
            return $response->withJson($res_array);
        }

    }
    else
    {
        // authorisation header is not present in request
        $res_array["message"] = "Authorisation Header not present";
        $res_array["code"] = "401";
        return $response->withJson($res_array);
    } 
}
// ==================================================================
// ==================  UTILITIES ======================== START =====
// ==================================================================

function getDBs(Request $request, Response $response)
{
    $body = $request->getBody()->getContents();
    $body = (array)json_decode($body);
    //echo $body['URL'];
    $db_list = [];
    $db = new mysqli($body['URL'], 'remote', '123', '');
    $query = 'show databases';
    $results = $db->query($query);
    while($row = $results->fetch_assoc())
    {
        array_push($db_list, $row['Database']);
    }
    $db->close();

    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    $res_array["results"] = $db_list;
    $res_array["message"] = "success";
    $res_array["code"] = "200";
    return $response->withJson($res_array);
   
}

function getTables(Request $request, Response $response)
{
    $body = $request->getBody()->getContents();
    $body = (array)json_decode($body);
    //echo $body['URL'];
    $table_list = [];
    $db = new mysqli($body['URL'], 'remote', '123', '');
    $db_name = $body["DatabaseName"];

    $query = "show tables from $db_name";
    //echo $query;
    $results = $db->query($query);

    while($row = $results->fetch_assoc())
    {
        $table = array_values($row);
        array_push($table_list, $table[0]);
    }
    $db->close();

    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    $res_array["results"] = $table_list;
    $res_array["message"] = "success";
    $res_array["code"] = "200";
    return $response->withJson($res_array);
}

function getColumns(Request $request, Response $response)
{
    $body = $request->getBody()->getContents();
    $body = (array)json_decode($body);
    //echo $body['URL'];
    $col_list = [];
    $db = new mysqli($body['URL'], 'remote', '123', '');
    $db_name = $body["DatabaseName"];
    $db->select_db($db_name);

    $table_name = $body["TableName"];

    $query = "show columns from $table_name";
    //echo $query;
    $results = $db->query($query);

    while($row = $results->fetch_assoc())
    {
        $table = array_values($row);
        array_push($col_list, $table[0]);
    }
    $db->close();

    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    $res_array["results"] = $col_list;
    $res_array["message"] = "success";
    $res_array["code"] = "200";
    return $response->withJson($res_array);
}

function checkServerURL(Request $request, Response $response)
{
    $body = $request->getBody()->getContents();
    $body = (array)json_decode($body);


    $db = mysql_connect($body['URL'], 'remote', '123');

    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    if($db != false)
    {
        $res_array["message"] = "success";
        $res_array["code"] = "200";
    }
    else
    {
        $res_array["message"] = "failure";
        $res_array["code"] = "400";   
    }
    
    return $response->withJson($res_array);
}

function checkServerAll(Request $request, Response $response)
{
    $body = $request->getBody()->getContents();
    $body = (array)json_decode($body);


    $db = mysql_connect($body['URL'], $body['Username'], $body['Password']);

    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    if($db != false)
    {
        $res_array["message"] = "success";
        $res_array["code"] = "200";
    }
    else
    {
        $res_array["message"] = "failure";
        $res_array["code"] = "400";   
    }
    
    return $response->withJson($res_array);
}

function test(Request $request, Response $response)
{
    //echo "in testing request";
    // $db = mysql_connect('192.168.43.216', 'skynet', '123');
    $file = file_get_contents('http://192.168.0.100/apis/test_api.php');
    var_dump($file);
}

// ==================================================================
// ==================  UTILITIES ======================== END =======
// ==================================================================


// ==================================================================
// ==================  DEPARTMENT ======================== START ====
// ==================================================================

function getDepartments(Request $request, Response $response)
{
    //sleep(2); // to show loader
    $res_array = getAllHandler(["DeptId", "DeptName"], "department", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
    
}

function getDepartment(Request $request, Response $response)
{
    
    $res_array = getHandler(["DeptId", "DeptName", "CreatedBy", "CreatedDateTime", "ModifyBy", "ModifyDateTime"], "DeptId", "departmentId", "department", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

function addDepartment(Request $request, Response $response)
{
    $res_array = addHelper(["DeptName"], "DeptId", "department", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
    
}

function deleteDepartment(Request $request, Response $response){

    $res_array = deleteHelper("departmentId", "DeptId", "department", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

function updateDepartment(Request $request, Response $response){

    $res_array = updateHelper(["DeptName"], "DeptId", "departmentId", "department", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
    
}

function getProjectsByDepartment(Request $request, Response $response){

    $res_array = getXsByY("project", "department", ["ProjectId", "ProjectName"], "DeptId", "departmentId", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

function getSubDepartmentsByDepartment(Request $request, Response $response){
    
    $res_array = getXsByY("subdepartment", "department", ["SubDeptId", "SubDeptName"], "DeptId", "departmentId", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

// ==================================================================
// ==================  DEPARTMENT ======================== END   ====
// ==================================================================

// ==================================================================
// ==================  SUB DEPARTMENT ==================== START ====
// ==================================================================

function getSubDepartments(Request $request, Response $response){

    $res_array = getAllHandler(["SubDeptId", "SubDeptName"], "subdepartment", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);

}

function getSubDepartment(Request $request, Response $response){

    $res_array = getHandler(["SubDeptId", "SubDeptName","DeptId", "BCNT", "CreatedBy", "CreatedDateTime", "ModifyBy", "ModifyDateTime"], "SubDeptId", "subDepartmentId", "subdepartment", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);    
}

function addSubDepartment(Request $request, Response $response){

    $res_array = addHelper(["SubDeptName", "DeptId"], "SubDeptId", "subdepartment", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);    
}

function deleteSubDepartment(Request $request, Response $response){

    $res_array = deleteHelper("subDepartmentId", "SubDeptId", "subdepartment", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}    

function updateSubDepartment(Request $request, Response $response){

    $res_array = updateHelper(["SubDeptName", "DeptId"], "SubDeptId", "subDepartmentId", "subdepartment", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);   
}

function getProjectsBySubDepartment(Request $request, Response $response){

    $res_array = getXsByY("project", "subdepartment", ["ProjectId", "ProjectName"], "SubDeptId", "subDepartmentId", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

// ==================================================================
// ==================  SUB DEPARTMENT ==================== END   ====
// ==================================================================

// ==================================================================
// ==================  PROJECTS ========================== START ====
// ==================================================================

function getProjects(Request $request, Response $response){

    $res_array = getAllHandler(["ProjectId", "ProjectName"], "project", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

function getProject(Request $request, Response $response){

    $res_array = getHandler(["ProjectId", "ProjectName","SubDeptId", "DeptId", "CreatedBy", "CreatedDateTime", "ModifyBy", "ModifyDateTime"], "ProjectId", "projectId", "project", $request);
    return $response->withJson($res_array, (int)$res_array["code"]); 
}

function addProject(Request $request, Response $response){

    $res_array = addHelper(["ProjectName", "DeptId", "SubDeptId"], "ProjectId", "project", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);  
}

function deleteProject(Request $request, Response $response){

    $res_array = deleteHelper("projectId", "ProjectId", "project", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);    
}

function updateProject(Request $request, Response $response){

    $res_array = updateHelper(["ProjectName", "DeptId", "SubDeptId"], "ProjectId", "projectId", "project", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

function getAPIRequestsByProject(Request $request, Response $response){

    $res_array = getXsByY("apirequest", "project", ["RequestId", "URL", "SubFrequencyId", "RequestType"], "ProjectId", "projectId", $request);

    // convert codes of sub frequency into description 
    $db = connectDB();
    
    foreach ($res_array["results"] as &$object) {
        $object["Frequency"] = getFrequencyById($db, $object["SubFrequencyId"]);
        //unset($object["SubFrequencyId"]);
    }

    $db->close();
    return $response->withJson($res_array, (int)$res_array["code"]);    
}

// ==================================================================
// ==================  PROJECTS ========================== END   ====
// ==================================================================


// ==================================================================
// ==================  API REQUESTS ====================== START ====
// ==================================================================

function getAPIRequests(Request $request, Response $response){

    $res_array = getAllHandler(["RequestId", "URL", "SubFrequencyId", "RequestType"], "apirequest", $request);
    $db = connectDB();
    
    foreach ($res_array["results"] as &$object) {
        $object["Frequency"] = getFrequencyById($db, $object["SubFrequencyId"]);
        //addArguments($db, $object); // in db helper
        
    }

    $db->close();
    return $response->withJson($res_array, (int)$res_array["code"]);
}

function getAPIRequest(Request $request, Response $response){

    $res_array = getHandler(["RequestId", "ProjectId","SubFrequencyId", "URL", "SampleResult", "Description", "RequestType", "ResultType", "StartFrom", "Upto", "CreatedBy", "CreatedDateTime", "ModifyBy", "ModifyDateTime"], "RequestId", "apiRequestId", "apirequest", $request);
     // convert codes of sub frequency into description 
    $db = connectDB();
    
    foreach ($res_array["results"] as &$object) {
        $object["Frequency"] = getFrequencyById($db, $object["SubFrequencyId"]);
        $object["StartFrom"] = $object["StartFrom"]."Z"; // to make the date time denote standart UTC Time
        $object["Upto"] = $object["Upto"]."Z";
        addArguments($db, $object); // in db helper
        
    }

    $db->close();
    return $response->withJson($res_array, (int)$res_array["code"]); 
}

function addAPIRequest(Request $request, Response $response){

    // would be a bit complex unlike other resources
    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    $body = $request->getBody()->getContents();
    $body = (array)json_decode($body);
    
    $token = $request->getAttribute('token');
    $UserId = $token->data->UserId;
    
    $db = connectDB();
    if ($db->connect_error) {

        $res_array["message"] = "Connection failed ".$db->connect_error;
        $res_array["code"] = "error code for connection fail";
        return $response->withJson($res_array);
    }

     // turn auto commit to false as we are dealing with more than one tables here and it may happen that insertion happens in first one
    // but not in second one. in that case we would just not commit and DB would be in original state
    $db->autocommit(FALSE);

    // check if every required field to insert is present
    $req_fields = ["URL", "ProjectId", "SubFrequencyId", "RequestType", "RequestArguments", "Description", "ResultType", "StartFrom", "Upto"];
    foreach ($req_fields as $field) {
        if(!isset($body[$field])){  
            $res_array["message"] = "Request faied; Required field $field not found";
            $res_array["code"] = "400";
            return $response->withJson($res_array, (int)$res_array["code"]);   
        }
    }        
    unset($req_fields[4]); // remove Request Arguments for now as it will be handled differently
    
    
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

    // first insert into api request table

    $query = "insert into apirequest($field_string,CreatedBy,CreatedDateTime,ModifyBy,ModifyDateTime) values($value_string,$CreatedBy,'$CreatedDateTime',$ModifyBy,'$ModifyDateTime')";
    $result = $db->query($query);
    $RequestId = $db->insert_id;

    if($result == TRUE)
    {
        // api request inserted -- now we need to insert the arguments into the api request arg table
        // along the process also form the query string which will be useful while calling the api to fetch the response
        $api_query_string = '?';

        foreach ($body["RequestArguments"] as $key => $value) {
            $api_query_string .=$key."=".$value."&"; 

            $query = "insert into apirequestargs(RequestId, ArgumentKey, ArgumentValue) values($RequestId, '$key', '$value')";
            $result = $db->query($query);
            if($result == FALSE)
            {
                $db->close();
                $res_array["message"] = "Request Failed; Server Error";
                $res_array["code"] = "400";
                return $response->withJson($res_array, 400);
            }
        }
        // remove the last extra & form the api_query string
        $api_query_string = substr($api_query_string, 0, strlen($api_query_string) - 1);

        // all the arguments inserted 
        // now we have to fetch the response, process it for getting the attributes and store them
        
        $api_response_fetched = file_get_contents($body['URL'].$api_query_string);

        // insert this fetched response into the sample result field in the api request table

        $query = "update apirequest set SampleResult='$api_response_fetched' where RequestId=$RequestId";
        $result = $db->query($query);

        if($result == FALSE)
        {
            //$db->close();
            $res_array["message"] = "Request Failed; Server Error".$db->error;
            $res_array["code"] = "400";
            return $response->withJson($res_array, 400);
        }

        // convert the string to array for further processing
        $api_response_fetched = json_decode($api_response_fetched, true); // an associative array

        $object = new StdClass();
        $object->arr = $api_response_fetched;
        $object->id = -1;
        $object->level = 1;
        $object->string = '';

        $queue = [$object];
        

        while (sizeof($queue) > 0) {
            $curr = array_shift($queue);
            $curr_array = $curr->arr;
            $ParentAttributeId = $curr->id;

            
            foreach ($curr_array as $key => $value) {

                $AttributeName = $key;
                $AttributeType = '';
                if(gettype($value) == "string")
                    $AttributeType = "atomic";
                else
                    $AttributeType = "object";
                $DepthLevel = $curr->level;
                $TraversalString = $curr->string.','.$AttributeName;

                $query = "insert into apiresultattribute(RequestId,ParentAttributeId,AttributeName,AttributeType,DepthLevel,TraversalString) values
                ($RequestId,$ParentAttributeId,'$AttributeName','$AttributeType',$DepthLevel,'$TraversalString')";
                
                $result = $db->query($query);
                if($result == FALSE)
                {

                    $db->close();
                    $res_array["message"] = "Request Failed; Server Error";
                    $res_array["code"] = "400";
                    return $response->withJson($res_array, 400);   
                }

                if($AttributeType == "object") // this is an array which needs to be recursively checked for more attributes
                {
                    $id = $db->insert_id;
                    $level = $curr->level + 1;
                    $string = $curr->string;
                    array_push($queue, (object)array("arr"=>$value, "id"=>$id, "level"=>$level, "string"=>$TraversalString));
                }

            }
            
        }
        
        $db->commit();
        $db->close();

        $res_array["message"] = "success";
        $res_array["code"] = "200";
        return $response->withJson($res_array);

    }
    else
    {
        $db->close();
        $res_array["message"] = "Request Failed; Server Error";
        $res_array["code"] = "400";
        return $response->withJson($res_array, 400);
    }

}

function deleteAPIRequest(Request $request, Response $response){

    $res_array = deleteHelper("apiRequestId", "RequestId", "apirequest", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);    
}

function updateAPIRequest(Request $request, Response $response){

    // can update fields of ProjectId, SubFrequencyId, Description, StartFrom and Upto
    $res_array = updateHelper(["ProjectId", "SubFrequencyId", "Description", "StartFrom", "Upto"], "RequestId", "apiRequestId", "apirequest", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

function getResultAttributesByAPIRequest(Request $request, Response $response){

    $res_array = getXsByY("apiresultattribute", "apirequest", ["AttributeId", "AttributeName", "DepthLevel", "AttributeType"], "RequestId", "apiRequestId", $request);
    $array = &$res_array["results"];
    //var_dump($array);
    $length = sizeof($array);
    for($i = 0; $i < $length; $i++)
    {
        //echo $array[$i]["AttributeName"] . '=>' . $array[$i]["AttributeType"] . "\n";
        if($array[$i]["AttributeType"] === "object")
        {
            // echo $array[$i]["AttributeName"] . '=>' . $array[$i]["AttributeType"] . '\n';
            unset($res_array["results"][$i]);
            
        }

    }
    $array = array_values($array);
    //var_dump($res_array);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

function getMappingsByAPIRequest(Request $request, Response $response)
{
    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    $RequestId = $request->getAttribute('apiRequestId');
    
    $db = connectDB();
    if ($db->connect_error) {

        $res_array["message"] = "Connection failed ".$db->connect_error;
        $res_array["code"] = "500";
        return $response->withJson($res_array, 500);
    }

    $id_present = checkId($db, "apirequest", "RequestId", $RequestId);
    if($id_present === FALSE)
    {
        $res_array["message"] = "Request failed; Resource with given Id doesn't exist not found";
        $res_array["code"] = "400";
        return $response->withJson($res_array, 400);
    }

    $query = "select MappingId,AttributeId,ExecServerName,ExecDbName,ExecUserName,ExecObjName,ColumnName,TraversalString,CreatedBy,CreatedDateTime,ModifyBy,ModifyDateTime from apiattributemapping natural join apiresultattribute WHERE RequestId=$RequestId";
    $result = $db->query($query);
    
    
    while($row = $result->fetch_assoc())
    {
        $objArray = array();
        
        $objArray["MappingId"] = $row["MappingId"];
        $objArray["AttributeId"] = $row["AttributeId"];
        $objArray["ExecServerName"] = $row["ExecServerName"];
        $objArray["ExecDbName"] = $row["ExecDbName"];
        $objArray["ExecUserName"] = $row["ExecUserName"];
        $objArray["ExecObjName"] = $row["ExecObjName"];
        $objArray["ColumnName"] = $row["ColumnName"];
        $objArray["TraversalString"] = substr($row["TraversalString"], 1);
        $objArray["CreatedBy"] = $row["CreatedBy"];
        $objArray["CreatedDateTime"] = $row["CreatedDateTime"];
        $objArray["ModifyBy"] = $row["ModifyBy"];
        $objArray["ModifyDateTime"] = $row["ModifyDateTime"];
        array_push($res_array["results"], $objArray);
    }
    $db->close();
    $res_array["message"] = "success";
    $res_array["code"] = "200";
    return $response->withJson($res_array, 200);
}

// ==================================================================
// ==================  API REQUESTS ====================== END   ====
// ==================================================================

// ==================================================================
// ==================  ATTRIBUTES ======================== START ====
// ==================================================================


function getAttribute(Request $request, Response $response)
{
    $res_array = array("results"=>array(),"message"=>"","code"=>"");
    $AttributeId = $request->getAttribute('attributeId');
    
    $db = connectDB();
    if ($db->connect_error) {

        $res_array["message"] = "Connection failed ".$db->connect_error;
        $res_array["code"] = "500";
        return $response->withJson($res_array, 500);
    }

    $id_present = checkId($db, "apiresultattribute", "AttributeId", $AttributeId);
    if($id_present === FALSE)
    {
        $res_array["message"] = "Request failed; Resource with given Id doesn't exist not found";
        $res_array["code"] = "400";
        return $response->withJson($res_array, 400);
    }

    $query = "select * from apiresultattribute where AttributeId=$AttributeId";
    $result = $db->query($query);
    
    
    while($row = $result->fetch_assoc())
    {
        $objArray = array();
        
        $objArray["AttributeId"] = $row["AttributeId"];
        $objArray["RequestId"] = $row["RequestId"];
        $objArray["AttributeName"] = $row["AttributeName"];
        $objArray["DepthLevel"] = $row["DepthLevel"];
        $objArray["DisplayOrder"] = $row["DisplayOrder"];
        $objArray["Description"] = $row["Description"];
        $objArray["DataType"] = $row["DataType"];
        $objArray["TraversalString"] = substr($row["TraversalString"], 1);
        array_push($res_array["results"], $objArray);
    }
    $db->close();
    $res_array["message"] = "success";
    $res_array["code"] = "200";
    return $response->withJson($res_array, 200);
}

function getMappingsByAttribute(Request $request, Response $response)
{
    $res_array = getXsByY("apiattributemapping", "apiresultattribute", ["MappingId", "AttributeId", "ExecServerName", "ExecDbName", "ExecUserName", "ExecObjName", "ColumnName"], "AttributeId", "attributeId", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

// ==================================================================
// ==================  ATTRIBUTES ======================== END   ====
// ==================================================================

// ==================================================================
// ==================  FREQUENCY ========================= START   ==
// ==================================================================

function getFrequencies(Request $request, Response $response){
    $res_array = getAllHandler(["SubFrequencyId", "SubFrequencyDesc", "FrequencyId", "TimeInterval", "Unit"], "subfrequency", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

// ==================================================================
// ==================  FREQUENCY ========================= END   ====
// ==================================================================

// ==================================================================
// ==================  MAPPINGS ========================= START    ==
// ==================================================================

function addMapping(Request $request, Response $response)
{
    $res_array = addHelper(["AttributeId", "ExecServerName", "ExecObjName", "ExecDbName", "ExecUserName", "ColumnName"], "MappingId", "apiattributemapping", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

function deleteMapping(Request $request, Response $response)
{
    $res_array = deleteHelper("mappingId", "MappingId", "apiattributemapping", $request);
    return $response->withJson($res_array, (int)$res_array["code"]);
}

// ==================================================================
// ==================  MAPPINGS ========================== END   ====
// ==================================================================



$app->run();

 // 45, 47, 49, 52, 53, 54, 55, 57, 58, 59

?>